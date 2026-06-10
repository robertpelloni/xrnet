use libp2p::{
    identity, mdns, ping, kad, gossipsub,
    swarm::{NetworkBehaviour, SwarmEvent},
    PeerId,
};
use std::error::Error;
use std::time::Duration;
use futures::StreamExt;
use tokio::sync::mpsc;
use std::sync::Arc;
use crate::{AppState, Command, ProtocolMessage};

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
                .heartbeat_interval(Duration::from_millis(500))
                .mesh_n_low(3)
                .mesh_n(6)
                .mesh_n_high(12)
                .gossip_lazy(3)
                .history_length(5)
                .history_gossip(3)
                .validation_mode(gossipsub::ValidationMode::Strict)
                .message_id_fn(message_id_fn)
                .build()
                .map_err(|msg| std::io::Error::new(std::io::ErrorKind::Other, msg))?;

            let mut gossipsub = gossipsub::Behaviour::new(
                gossipsub::MessageAuthenticity::Signed(key.clone()),
                gossipsub_config,
            ).map_err(|msg| std::io::Error::new(std::io::ErrorKind::Other, msg))?;

            let topic = gossipsub::IdentTopic::new("xrnet-global");
            gossipsub.subscribe(&topic)?;

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

    let mut peer_check_interval = tokio::time::interval(Duration::from_secs(5));

    loop {
        tokio::select! {
            _ = peer_check_interval.tick() => {
                let peer_count = swarm.connected_peers().count();
                let mut p = state.peers.lock().unwrap();
                *p = peer_count;

                // Bandwidth tracking (manual stub if feature unavailable)
                *state.bandwidth_in.lock().unwrap() = 0;
                *state.bandwidth_out.lock().unwrap() = 0;
            }
            Some(cmd) = command_rx.recv() => {
                match cmd {
                    Command::PutRecord { key, value } => {
                        let k = kad::RecordKey::new(&key);
                        let record = kad::Record {
                            key: k,
                            value: value.into_bytes(),
                            publisher: None,
                            expires: None,
                        };
                        swarm.behaviour_mut().kad.put_record(record, kad::Quorum::One).expect("Failed to put record");
                        println!("[PROTOCOL] Initiated Kademlia PUT for key: {}", key);
                    }
                    Command::SendMessage { topic, message } => {
                        let t = gossipsub::IdentTopic::new(topic);
                        let p_msg = ProtocolMessage {
                            id: format!("{}_{}", state.peer_id, std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis()),
                            content: message,
                            timestamp: std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis() as u64,
                            sender: state.peer_id.clone(),
                        };

                        if let Ok(data) = serde_json::to_vec(&p_msg) {
                            if let Err(e) = swarm.behaviour_mut().gossipsub.publish(t, data) {
                                println!("[PROTOCOL] Publish error: {:?}", e);
                            }
                        }
                    }
                    Command::GetRecord { key } => {
                        let k = kad::RecordKey::new(&key);
                        swarm.behaviour_mut().kad.get_record(k);
                        println!("[PROTOCOL] Initiated Kademlia GET for key: {}", key);
                    }
                    Command::AddPeer { peer_id, address } => {
                        if let Ok(pid) = peer_id.parse::<PeerId>() {
                            if let Ok(addr) = address.parse::<libp2p::Multiaddr>() {
                                state.discovery.add_static_peer(pid, addr, &mut swarm.behaviour_mut().kad);
                            }
                        }
                    }
                }
            }
            event = swarm.select_next_some() => match event {
                SwarmEvent::NewListenAddr { address, .. } => {
                    println!("[PROTOCOL] Listening on {:?}", address);
                }
                SwarmEvent::Behaviour(MyBehaviourEvent::Mdns(event)) => {
                    state.discovery.handle_mdns_event(event, &mut swarm.behaviour_mut().kad);
                }
                SwarmEvent::Behaviour(MyBehaviourEvent::Ping(ping::Event {
                    peer,
                    result: Ok(rtt),
                    ..
                })) => {
                    state.update_latency(peer.to_string(), rtt.as_millis() as u64);
                }
                SwarmEvent::Behaviour(MyBehaviourEvent::Kad(event)) => {
                    println!("[PROTOCOL] Kademlia Event: {:?}", event);
                    if let kad::Event::OutboundQueryProgressed {
                        result: kad::QueryResult::GetRecord(Ok(kad::GetRecordOk::FoundRecord(kad::PeerRecord { record, .. }))),
                        ..
                    } = event {
                        let key = String::from_utf8_lossy(record.key.as_ref()).to_string();
                        let value = String::from_utf8_lossy(&record.value).to_string();
                        println!("[PROTOCOL] Found record: {} = {}", key, value);
                        state.handle_dht_record(key, value);
                    }
                }
                SwarmEvent::Behaviour(MyBehaviourEvent::Gossipsub(gossipsub::Event::Message {
                    propagation_source: _peer_id,
                    message_id: id,
                    message,
                })) => {
                    if let Ok(p_msg) = serde_json::from_slice::<ProtocolMessage>(&message.data) {
                        let now = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis() as u64;
                        let latency = now.saturating_sub(p_msg.timestamp);

                        {
                            let mut l = state.e2e_latencies.lock().unwrap();
                            l.push(latency);
                            if l.len() > 100 { l.remove(0); }
                            *state.messages_delivered.lock().unwrap() += 1;
                        }

                        println!("[PROTOCOL] Got mesh message: '{}' with id: {} from peer: {} (Latency: {}ms)", p_msg.content, id, p_msg.sender, latency);
                        state.increment_recv();
                        state.add_message(p_msg.sender, p_msg.content);
                    } else {
                        let content = String::from_utf8_lossy(&message.data).to_string();
                        println!("[PROTOCOL] Got raw message: '{}' with id: {} from source: {}", content, id, _peer_id);
                        state.increment_recv();
                        state.add_message(_peer_id.to_string(), content);
                    }
                }
                _ => {}
            }
        }
    }
}
