use libp2p::{identity, mdns, ping, kad, gossipsub, swarm::{NetworkBehaviour, SwarmEvent}, PeerId};
use std::error::Error;
use std::time::Duration;
use futures::StreamExt;
use tokio::sync::mpsc;
use std::sync::Arc;
use crate::{AppState, Command};
use crate::routing::{RoutingEngine, MeshPacket, RouteUpdate, DistanceVectorTable};

#[derive(NetworkBehaviour)]
pub struct MyBehaviour {
    pub ping: ping::Behaviour,
    pub mdns: mdns::tokio::Behaviour,
    pub kad: kad::Behaviour<kad::store::MemoryStore>,
    pub gossipsub: gossipsub::Behaviour,
}

pub async fn run_mesh(
    local_key: identity::Keypair,
    state: Arc<AppState>,
    mut command_rx: mpsc::Receiver<Command>,
) -> Result<(), Box<dyn Error>> {
    let local_peer_id = PeerId::from(local_key.public());

    // --- Initialize Distance-Vector routing  ---
    let mut routing_engine = RoutingEngine::new();
    let mut dv_table = DistanceVectorTable::new();
    
    // Add initial direct routes for known direct neighbors
    let _ = state.peers.lock().unwrap(); // dummy to satisfy borrow

    let mut swarm = libp2p::SwarmBuilder::with_existing_identity(local_key)
        .with_tokio()
        .with_tcp(
            libp2p::tcp::Config::default(),
            libp2p::noise::Config::new,
            libp2p::yamux::Config::default,
        )?
        .with_behaviour(|key| {
            let store = kad::store::MemoryStore::new(local_peer_id);
            let message_id_fn = |message: &gossipsub::Message| {
                let mut s = std::collections::hash_map::DefaultHasher::new();
                std::hash::Hash::hash(&message.data, &mut s);
                gossipsub::MessageId::from(std::hash::Hasher::finish(&s).to_string())
            };
            let gossipsub_config = gossipsub::ConfigBuilder::default()
                .heartbeat_interval(Duration::from_secs(1))
                .validation_mode(gossipsub::ValidationMode::Strict)
                .message_id_fn(message_id_fn)
                .build()
                .map_err(std::io::Error::other)?;

            let mut gossipsub = gossipsub::Behaviour::new(
                gossipsub::MessageAuthenticity::Signed(key.clone()),
                gossipsub_config,
            )
            .map_err(std::io::Error::other)?;

            // Subscribe to routing topic for packet exchange
            let topic = gossipsub::IdentTopic::new("xrnet-global");
            gossipsub.subscribe(&topic)?;
            let route_topic = gossipsub::IdentTopic::new("xrnet-routing");
            gossipsub.subscribe(&route_topic)?;
            // Subscribe to route update topic to exchange routing table
            let update_topic = gossipsub::IdentTopic::new("xrnet-route-update");
            gossipsub.subscribe(&update_topic)?;

            Ok(MyBehaviour {
                ping: ping::Behaviour::default(),
                mdns: mdns::tokio::Behaviour::new(mdns::Config::default(), local_peer_id)?,
                kad: kad::Behaviour::new(local_peer_id, store),
                gossipsub,
            })
        })?
        .with_swarm_config(|c| c.with_idle_connection_timeout(Duration::from_secs(60)))
        .build();

    swarm.listen_on("/ip4/0.0.0.0/tcp/0".parse()?)?;

    let mut route_advert_interval = tokio::time::interval(Duration::from_secs(30));
    route_advert_interval.set_missed_tick_behavior(tokio::time::MissedTickBehavior::Skip);

    println!("[MESH] Initialized multi-hop routing engine with distance-vector protocol.");

    loop {
        tokio::select! {
            Some(cmd) = command_rx.recv() => {
                match cmd {
                    Command::PutRecord { key, value } => {
                        let k = kad::RecordKey::new(&key);
                        let record = kad::Record { key: k, value: value.into_bytes(), publisher: None, expires: None };
                        swarm.behaviour_mut().kad.put_record(record, kad::Quorum::One).expect("Failed to put record");
                        println!("[PROTOCOL] Initiated Kademlia PUT for key: {}", key);
                    }
                    Command::SendMessage { topic, message } => {
                        let t = gossipsub::IdentTopic::new(topic);
                        if let Err(e) = swarm.behaviour_mut().gossipsub.publish(t, message.into_bytes()) {
                            println!("[PROTOCOL] Publish error: {:?}", e);
                        }
                    }
                }
            }
            
            // --- Routing advertisements and periodic updates ---
            _ = route_advert_interval.tick() => {
                let seq = dv_table.next_sequence();
                let entries = dv_table.advertisement_entries();
                let update = RouteUpdate { 
                    source_peer: local_peer_id.to_string(),
                    sequence_number: seq,
                    entries,
                };
                let update_topic = gossipsub::IdentTopic::new("xrnet-route-update");
                if let Ok(data) = serde_json::to_vec(&update) {
                    if let Err(e) = swarm.behaviour_mut().gossipsub.publish(update_topic, data) {
                        println!("[ROUTE/ADV] Advertisement publish error: {:?}", e);
                    } else {
                        println!("[ROUTE/ADV] Sent {} routing entries (seq={})", update.entries.len(), seq);
                    }
                }
            }
            
            // --- Main event loop ---
            event = swarm.select_next_some() => match event {
                SwarmEvent::NewListenAddr { address, .. } => {
                    println!("[PROTOCOL] Listening on {:?}", address);
                }
                SwarmEvent::Behaviour(MyBehaviourEvent::Mdns(mdns::Event::Discovered(list))) => {
                    for (peer_id, addr) in list {
                        let mut p = state.peers.lock().unwrap();
                        *p += 1;
                        println!("[MESH] Discovered peer {} at {:?}", peer_id, addr);
                        swarm.behaviour_mut().kad.add_address(&peer_id, addr);
                        // Add direct route to this newly discovered peer
                        dv_table.add_direct_route(peer_id.to_string().as_str(), 1);
                        let count = dv_table.route_count();
                        // log routing info every few peers
                        if count.is_multiple_of(5) { println!("[ROUTE] Routing table size: {}", count); }
                        routing_engine.update_neutrality(peer_id.to_string(), 0.9); // initial supposition
                    }
                }
                SwarmEvent::Behaviour(MyBehaviourEvent::Kad(kad::Event::OutboundQueryProgressed { result: kad::QueryResult::GetRecord(Ok(kad::GetRecordOk::FoundRecord(record))), .. })) => {
                    let key = String::from_utf8_lossy(record.record.key.as_ref()).to_string();
                    let value = String::from_utf8_lossy(&record.record.value).to_string();
                    println!("[PROTOCOL] Found DHT Record: {} = {}", key, value);
                    if key.starts_with("job:") {
                        let mut jobs = state.jobs.lock().unwrap();
                        jobs.insert(key, value);
                    }
                }
                SwarmEvent::Behaviour(MyBehaviourEvent::Kad(event)) => {
                    println!("[PROTOCOL] Kademlia Event: {:?}", event);
                }
                
                // --- Statement exchange via Gossipsub ---
                SwarmEvent::Behaviour(MyBehaviourEvent::Gossipsub(gossipsub::Event::Message { propagation_source: peer_id, message_id: _id, message })) => {
                    let topic = message.topic.to_string();
                    if topic == "xrnet-route-update" {
                        if let Ok(update) = serde_json::from_slice::<RouteUpdate>(&message.data) {
                            // Process route update via distance-vector engine
                            let changed = dv_table.process_update(&update, &peer_id.to_string());
                            if changed {
                                println!("[ROUTE/UPDATE] Adopted new routes from {} (seq={})", peer_id, update.sequence_number);
                                // Force immediate re-advertisement to propagate change quickly
                                let seq_now = dv_table.next_sequence();
                                let entries = dv_table.advertisement_entries();
                                let update_reply = RouteUpdate { source_peer: local_peer_id.to_string(), sequence_number: seq_now, entries };
                                let update_topic = gossipsub::IdentTopic::new("xrnet-route-update");
                                if let Ok(data) = serde_json::to_vec(&update_reply) {
                                    swarm.behaviour_mut().gossipsub.publish(update_topic, data).ok();
                                }
                            }
                        }
                    } else if topic == "xrnet-routing" {
                        if let Ok(mut packet) = serde_json::from_slice::<MeshPacket>(&message.data) {
                            let my_id = local_peer_id.to_string();
                            
                            // Decision based on packet destiny:
                            if packet.at_destination(&my_id) {
                                // Final delivery: log the packet reception (in a real app, this is app-layer handling)
                                println!("[ROUTE/DELIVER] Packet arrived to destination {} from {} (hops={}/{} bytes={})", 
                                    packet.destination, packet.source, packet.hop_count, packet.max_hops, packet.payload.len());
                            } else if packet.next_hop == my_id && !packet.is_expired() {
                                // We're the intended next hop and packet is still alive → forward it via routing + neutrality
                                let available: Vec<String> = swarm.connected_peers().map(|p| p.to_string()).collect();
                                if let Some(chosen_next) = routing_engine.route_packet(&packet, available, &dv_table) {
                                    // Actually advance and set next_hop to the chosen neighbor
                                    packet.advance(chosen_next);
                                    if let Ok(forward_data) = serde_json::to_vec(&packet) {
                                        let rt = gossipsub::IdentTopic::new("xrnet-routing");
                                        if let Err(e) = swarm.behaviour_mut().gossipsub.publish(rt, forward_data) {
                                            println!("[ROUTE/FWD] Forwarding publish error: {:?}", e);
                                        } else {
                                            println!("[ROUTE/FWD] Forwarded packet from {} to {} (dest={}) [hop {}/{}]", 
                                                packet.source, packet.next_hop, packet.destination, packet.hop_count, packet.max_hops);
                                        }
                                    }
                                }
                            } else {
                                // Packet is not for us right now; discard based on topic dedup or silence errors
                                // println!("[ROUTE/SKIP] Packet not for us right now: dest={} next_hop={} local={}", packet.destination, packet.next_hop, my_id);
                            }
                        }
                    } else {
                        println!("[PROTOCOL] Got gossipsub message on topic: {} (len={})", topic, message.data.len());
                    }
                }
                _ => {}
            }
        }
    }
}
