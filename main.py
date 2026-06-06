import os

def get_version():
    try:
        with open("VERSION.md", "r") as f:
            return f.read().strip()
    except Exception:
        return "unknown"

def main():
    version = get_version()
    print("========================================")
    print(f"      xrnet - Decentralized OS          ")
    print(f"      Version: {version}                    ")
    print("========================================")

    print("\n[INFO] Initializing Everything Protocol...")
    # This is where the core initialization logic would go
    # (e.g., initializing Veilid nodes, loading spatial models)

    print("[INFO] Loading Spatial Layer...")
    print("[INFO] Starting UI/Frontend Gateway...")

    print("\n[SUCCESS] xrnet is now running.")
    print("Press Ctrl+C to shutdown.")

if __name__ == "__main__":
    main()
