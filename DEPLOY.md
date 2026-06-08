# DEPLOY: xrnet Deployment & Setup

## Prerequisites
Before deploying xrnet, ensure your system meets the following requirements:
- **Rust:** `cargo` 1.70+
- **Node.js:** `npm` 10+ (Node 20+ recommended)
- **Python:** `python3` 3.10+
- **Git:** For repository synchronization.

## Setup Instructions
1. **Clone the Repository:**
   ```bash
   git clone --recursive https://github.com/robertpelloni/xrnet
   cd xrnet
   ```
2. **Initialize Submodules:**
   ```bash
   git submodule update --init --recursive
   ```

## Building the System
The unified `build.sh` script handles the compilation of the Rust backend and the installation/bundling of the React frontend.
```bash
./build.sh
```

## Running the Application
Use the `start.sh` script to launch the backend and the application coordinator concurrently.
```bash
./start.sh
```

## Verification & Testing
### Integrated Pipeline
For a complete build and test sequence, run:
```bash
./pipeline.sh
```
This script automates building, integrity validation, and E2E testing.

### Autonomous Execution Protocol
To execute the full autonomous workflow (Sync, Validate, Build, Test), run:
```bash
./autonomous_workflow.sh
```

### End-to-End Integration
Run the full E2E suite manually:
```bash
python3 tests/e2e_integration.py
```

### Performance Monitoring
To capture a baseline or monitor a live deployment:
```bash
python3 scripts/monitor_performance.py
```
This script collects CPU/RAM usage alongside P2P network metrics (peers, message throughput, uptime) and logs them to `performance.log`.

## Troubleshooting
- **Build Failures:** Ensure `cargo` and `npm` are in your PATH. Check `frontend/node_modules` if React fails to build.
- **Port Conflicts:** Ensure ports 8080 (Backend API) and any protocol-specific ports are available.
- **Permission Denied:** Ensure scripts are executable: `chmod +x *.sh`.
