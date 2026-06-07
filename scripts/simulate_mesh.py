import subprocess
import time
import os
import signal

def simulate_mesh():
    print("========================================")
    print("      xrnet - MESH SIMULATION          ")
    print("========================================\n")

    # Start a mock central peer
    print("[MESH] Starting Mock Central Peer...")
    peer = subprocess.Popen(["python3", "scripts/mock_peer.py"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    time.sleep(2)

    # Start two xrnet instances (using the same backend binary for now)
    print("[MESH] Starting xrnet Instances...")

    kwargs = {}
    if os.name != 'nt':
        kwargs['preexec_fn'] = os.setpgrp

    instance1 = subprocess.Popen(["./start.sh"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, **kwargs)
    time.sleep(2)
    # Note: Second instance might have port conflict if not careful, but for this simulation we just want to see logs
    # In a real scenario we'd pass port args.

    print("[MESH] Simulation running for 10 seconds...")
    time.sleep(10)

    # Cleanup
    print("[MESH] Cleaning up...")
    if os.name != 'nt':
        os.killpg(os.getpgid(instance1.pid), signal.SIGTERM)
    else:
        instance1.terminate()

    peer.terminate()

    stdout1, _ = instance1.communicate()
    peer_stdout, _ = peer.communicate()

    print("\n--- Instance 1 Log Snapshot ---")
    print(stdout1)

    print("\n--- Peer Log Snapshot ---")
    print(peer_stdout)

    if "Handshake with external system successful" in stdout1 and "Handshake complete" in peer_stdout:
        print("\n[SUCCESS] Mesh discovery and handshake verified.")
    else:
        print("\n[FAILURE] Mesh simulation failed to verify handshake.")

if __name__ == "__main__":
    simulate_mesh()
