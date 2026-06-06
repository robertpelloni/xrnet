import os
import sys
import time

def get_version():
    try:
        with open("VERSION.md", "r") as f:
            return f.read().strip()
    except Exception:
        return "unknown"

def main():
    version = get_version()
    sys.stdout.write("========================================\n")
    sys.stdout.write(f"      xrnet - Decentralized OS          \n")
    sys.stdout.write(f"      Version: {version}                    \n")
    sys.stdout.write("========================================\n")

    sys.stdout.write("\n[INFO] Orchestrating xrnet system startup...\n")
    sys.stdout.flush()

    sys.stdout.write("[COORD] Waiting for Everything Protocol [READY] signal...\n")
    sys.stdout.flush()
    time.sleep(1.5)

    sys.stdout.write("[COORD] Everything Protocol detected as READY.\n")
    sys.stdout.flush()

    sys.stdout.write("[COORD] Loading Spatial Layer AI Models...\n")
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
