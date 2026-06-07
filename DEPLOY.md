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
*Note: This will perform `npm install` and `npm run build` in the `frontend/` directory and `cargo build` in the `backend/` directory.*

## Running the Application
Use the `start.sh` script to launch the backend and the application coordinator concurrently.
```bash
./start.sh
```
The system will initialize the "Everything Protocol" and the spatial layer before starting the UI gateway.

## Verification & Testing
### Integrated Pipeline
For a complete build and test sequence, run:
```bash
./pipeline.sh
```
This script automates building, integrity validation, and E2E testing.

### End-to-End Integration
Run the full E2E suite to confirm system boot and process orchestration:
```bash
python3 tests/e2e_integration.py
```
### Repository Integrity
Validate that all required documentation and structural components are present:
```bash
python3 scripts/validate_integrity.py
```
### Backend Smoke Test
Individually test the backend protocol initialization:
```bash
python3 backend/test_smoke.py
```

## Troubleshooting
- **Build Failures:** Ensure `cargo` and `npm` are in your PATH. Check `frontend/node_modules` if React fails to build.
- **Port Conflicts:** Ensure ports 3000 (Vite) and any protocol-specific ports are available.
- **Permission Denied:** Ensure scripts are executable: `chmod +x *.sh`.
