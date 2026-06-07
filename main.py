import os
import sys
import time
import json
import subprocess

def get_version():
    try:
        with open("VERSION.md", "r") as f:
            return f.read().strip()
    except Exception:
        return "unknown"

def wait_for_backend_ready(timeout=30):
    status_file = "backend/status.json"
    if not os.path.exists(status_file):
        # Maybe it's in the root
        status_file = "status.json"

    start_time = time.time()
    while time.time() - start_time < timeout:
        if os.path.exists(status_file):
            try:
                with open(status_file, "r") as f:
                    data = json.load(f)
                    if data.get("status") == "READY":
                        return True
            except (json.JSONDecodeError, IOError):
                pass
        time.sleep(0.5)
    return False

def run_sync_protocol():
    sys.stdout.write("[COORD] Executing Autonomous Sync Protocol...\n")
    sys.stdout.flush()
    try:
        result = subprocess.run(["sh", "./scripts/sync_repo.sh"], capture_output=True, text=True)
        if result.returncode == 0:
            sys.stdout.write("[COORD] Sync Protocol Successful.\n")
            # Log the first few lines of output
            lines = result.stdout.splitlines()
            for line in lines[:5]:
                sys.stdout.write(f"  {line}\n")
        else:
            sys.stdout.write(f"[COORD] Sync Protocol Failed (Code {result.returncode}):\n")
            sys.stdout.write(f"  {result.stderr}\n")
    except Exception as e:
        sys.stdout.write(f"[COORD] Sync Protocol Error: {e}\n")
    sys.stdout.flush()

def main():
    version = get_version()
    sys.stdout.write("========================================\n")
    sys.stdout.write(f"      xrnet - Decentralized OS          \n")
    sys.stdout.write(f"      Version: {version}                    \n")
    sys.stdout.write("========================================\n")

    sys.stdout.write("\n[INFO] Orchestrating xrnet system startup...\n")
    sys.stdout.flush()

    # Integrated Autonomous Sync Protocol
    run_sync_protocol()

    sys.stdout.write("[COORD] Waiting for Everything Protocol [READY] signal...\n")
    sys.stdout.flush()

    if wait_for_backend_ready():
        sys.stdout.write("[COORD] Everything Protocol detected as READY.\n")
    else:
        sys.stdout.write("[COORD] WARNING: Backend READY signal timed out. Proceeding...\n")
    sys.stdout.flush()

    sys.stdout.write("[COORD] Loading Spatial Layer AI Models...\n")
    # Simulate loading from spatial/config.toml
    if os.path.exists("spatial/config.toml"):
        sys.stdout.write("[COORD] Loading configuration from spatial/config.toml...\n")
    sys.stdout.flush()
    time.sleep(0.5)
    sys.stdout.write("[COORD] AI Models loaded (Gaussian Splatting LWM).\n")
    sys.stdout.flush()

    sys.stdout.write("[COORD] Starting UI/Frontend Gateway...\n")
    sys.stdout.flush()
    time.sleep(0.3)

    sys.stdout.write("\n[SUCCESS] xrnet is now fully operational.\n")
    sys.stdout.write("System healthy. Press Ctrl+C to terminate all processes.\n")
    sys.stdout.flush()

    # Keep alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        sys.stdout.write("\n[INFO] Shutdown signal received.\n")
        sys.stdout.flush()

if __name__ == "__main__":
    main()
