import subprocess
import sys
import time
import os
import signal

def start_mesh_monitor():
    print("========================================")
    print("      xrnet MESH MONITORING SYSTEM     ")
    print("========================================\n")

    print("[SYSTEM] Starting Central Control Server and API...")
    # Using mock_peer.py which now includes the HTTP API
    proc = subprocess.Popen(["python3", "scripts/mock_peer.py"])

    print("\n[SUCCESS] Mesh Monitoring is active.")
    print("[URL] Mesh Dashboard: http://localhost:9001")
    print("[URL] Aggregated API: http://localhost:9001/api/mesh/status")
    print("\n[INFO] Press Ctrl+C to terminate the monitoring system.")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[SYSTEM] Shutting down...")
        proc.terminate()
        print("[SYSTEM] Monitoring terminated.")

if __name__ == "__main__":
    start_mesh_monitor()
