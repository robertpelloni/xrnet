use std::fs;
use std::error::Error;
use std::time::Duration;
use std::net::TcpStream;
use std::io::{Write, Read};
use libp2p::{
    identity, mdns, ping,
    swarm::SwarmEvent,
    PeerId,
};
use futures::StreamExt;
use serde_json::json;

#[derive(libp2p::swarm::NetworkBehaviour)]
struct MyBehaviour {
    ping: ping::Behaviour,
    mdns: mdns::tokio::Behaviour,
}

fn get_version() -> String {
    fs::read_to_string("VERSION.md")
        .or_else(|_| fs::read_to_string("../VERSION.md"))
        .map(|v| v.trim().to_string())
        .unwrap_or_else(|_| "unknown".to_string())
}

fn set_status(status: &str) {
    let status_data = json!({ "status": status });
    let _ = fs::write("status.json", status_data.to_string());
}

async fn connect_to_surrounding_system() -> bool {
    println!("[PROTOCOL] Attempting to connect to surrounding system (port 9000)...");

    for _ in 0..5 {
        if let Ok(mut stream) = TcpStream::connect("127.0.0.1:9000") {
            println!("[PROTOCOL] Connected to external peer.");
            let _ = stream.write_all(b"XRNET_HANDSHAKE");
            let mut buffer = [0; 10];
            if let Ok(_) = stream.read(&mut buffer) {
                if &buffer[..9] == b"XRNET_ACK" {
                    println!("[PROTOCOL] Handshake with external system successful.");
                    return true;
                }
            }
        }
        tokio::time::sleep(Duration::from_millis(1000)).await;
    }
    println!("[PROTOCOL] Warning: Could not connect to surrounding system. Operating in standalone mode.");
    false
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    set_status("INITIALIZING");
    let version = get_version();
    println!("========================================");
    println!("      xrnet-backend v{}              ", version);
    println!("========================================");

    println!("[INFO] Initializing Everything Protocol (libp2p)...");

    let local_key = identity::Keypair::generate_ed25519();
    let local_peer_id = PeerId::from(local_key.public());
    println!("[PROTOCOL] Local Peer ID: {:?}", local_peer_id);

    let mut swarm = libp2p::SwarmBuilder::with_existing_identity(local_key)
        .with_tokio()
        .with_tcp(
            libp2p::tcp::Config::default(),
            libp2p::noise::Config::new,
            libp2p::yamux::Config::default,
        )?
        .with_behaviour(|_key| {
            Ok(MyBehaviour {
                ping: ping::Behaviour::default(),
                mdns: mdns::tokio::Behaviour::new(mdns::Config::default(), local_peer_id)?,
            })
        })?
        .with_swarm_config(|c| c.with_idle_connection_timeout(Duration::from_secs(60)))
        .build();

    // Listen on all interfaces and whatever port the OS assigns
    swarm.listen_on("/ip4/0.0.0.0/tcp/0".parse()?)?;

    // Handshake Integration
    let integrated = connect_to_surrounding_system().await;

    println!("[INFO] Everything Protocol initialized successfully.");
    println!("[STATUS] READY");
    set_status("READY");

    if integrated {
        println!("[PROTOCOL] Connected to external network.");
    }

    loop {
        match swarm.select_next_some().await {
            SwarmEvent::NewListenAddr { address, .. } => {
                println!("[PROTOCOL] Listening on {:?}", address);
            }
            SwarmEvent::Behaviour(MyBehaviourEvent::Mdns(mdns::Event::Discovered(list))) => {
                for (peer_id, addr) in list {
                    println!("[PROTOCOL] Discovered peer {} at {:?}", peer_id, addr);
                }
            }
            SwarmEvent::Behaviour(MyBehaviourEvent::Mdns(mdns::Event::Expired(list))) => {
                for (peer_id, addr) in list {
                    println!("[PROTOCOL] Peer expired {} at {:?}", peer_id, addr);
                }
            }
            _ => {}
        }
    }
}
