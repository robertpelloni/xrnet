use std::fs;

fn get_version() -> String {
    // We are in backend/
    fs::read_to_string("VERSION.md") // Relative to where it is run
        .or_else(|_| fs::read_to_string("../VERSION.md"))
        .map(|v| v.trim().to_string())
        .unwrap_or_else(|_| "unknown".to_string())
}

fn main() {
    let version = get_version();
    println!("========================================");
    println!("      xrnet-backend v{}              ", version);
    println!("========================================");
    println!("[INFO] Initializing Everything Protocol...");
    println!("[INFO] Protocol initialized successfully.");
}
