use libp2p::{mdns, kad, PeerId, Multiaddr};
use std::collections::HashMap;
use std::sync::Mutex;

pub struct DiscoveryManager {
    pub bootstrap_nodes: Mutex<Vec<Multiaddr>>,
    pub routing_table: Mutex<HashMap<PeerId, Vec<Multiaddr>>>,
}

impl DiscoveryManager {
    pub fn new() -> Self {
        Self {
            bootstrap_nodes: Mutex::new(Vec::new()),
            routing_table: Mutex::new(HashMap::new()),
        }
    }

    pub fn handle_mdns_event(&self, event: mdns::Event, kad: &mut kad::Behaviour<kad::store::MemoryStore>) {
        if let mdns::Event::Discovered(list) = event {
            for (peer_id, addr) in list {
                println!("[DISCOVERY] mDNS discovered peer {} at {:?}", peer_id, addr);
                kad.add_address(&peer_id, addr.clone());
                let mut table = self.routing_table.lock().unwrap();
                table.entry(peer_id).or_insert(Vec::new()).push(addr);
            }
        }
    }

    pub fn add_static_peer(&self, peer_id: PeerId, addr: Multiaddr, kad: &mut kad::Behaviour<kad::store::MemoryStore>) {
        println!("[DISCOVERY] Adding static peer {} at {:?}", peer_id, addr);
        kad.add_address(&peer_id, addr.clone());
        let mut table = self.routing_table.lock().unwrap();
        table.entry(peer_id).or_insert(Vec::new()).push(addr);
    }
}
