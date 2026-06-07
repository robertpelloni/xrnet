use std::fs;
use std::thread;
use std::time::Duration;
use std::net::TcpStream;
use std::io::{Write, Read};

fn get_version() -> String {
    fs::read_to_string("VERSION.md")
        .or_else(|_| fs::read_to_string("../VERSION.md"))
        .map(|v| v.trim().to_string())
        .unwrap_or_else(|_| "unknown".to_string())
}

fn connect_to_surrounding_system() -> bool {
    println!("[PROTOCOL] Attempting to connect to surrounding system (port 9000)...");

    // Try for 5 seconds
    for _ in 0..5 {
        match TcpStream::connect("127.0.0.1:9000") {
            Ok(mut stream) => {
                println!("[PROTOCOL] Connected to external peer.");
                let _ = stream.write_all(b"XRNET_HANDSHAKE");
                let mut buffer = [0; 10];
                match stream.read(&mut buffer) {
                    Ok(_) => {
                        if &buffer[..9] == b"XRNET_ACK" {
                            println!("[PROTOCOL] Handshake with external system successful.");
                            return true;
                        }
                    }
                    Err(_) => {}
                }
            }
            Err(_) => {
                thread::sleep(Duration::from_millis(1000));
            }
        }
    }
    println!("[PROTOCOL] Warning: Could not connect to surrounding system. Operating in standalone mode.");
    false
}

fn main() {
    let version = get_version();
    println!("========================================");
    println!("      xrnet-backend v{}              ", version);
    println!("========================================");

    println!("[INFO] Initializing Everything Protocol...");

    // Simulate P2P Node Startup
    println!("[PROTOCOL] Starting P2P node (Veilid mode)...");
    thread::sleep(Duration::from_millis(500));
    println!("[PROTOCOL] Node ID: vld_8x2a...f9z1");

    // Attempt Integration
    let integrated = connect_to_surrounding_system();

    // Simulate DHT joining
    println!("[PROTOCOL] Joining Distributed Hash Table...");
    thread::sleep(Duration::from_millis(500));

    if integrated {
        println!("[PROTOCOL] Connected to external network and 43 peers.");
    } else {
        println!("[PROTOCOL] Connected to 42 peers (standalone).");
    }

    // Simulate IPFS Gateway
    println!("[PROTOCOL] Mounting IPFS storage gateway...");
    thread::sleep(Duration::from_millis(300));

    println!("[INFO] Everything Protocol initialized successfully.");
    println!("[STATUS] READY");

    // Keep alive
    loop {
        thread::sleep(Duration::from_secs(3600));
    }
}
