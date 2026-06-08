import subprocess
import time
import os
import signal
import requests

def simulate_mesh():
    print("========================================")
    print("      xrnet - MULTI-NODE BENCHMARK     ")
    print("========================================\n")

    # Start a mock central peer
    print("[MESH] Starting Mock Central Peer (Port 9000)...")
    peer = subprocess.Popen(["python3", "scripts/mock_peer.py"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    time.sleep(2)

    kwargs = {}
    if os.name != 'nt':
        kwargs['preexec_fn'] = os.setpgrp

    # Start Node 1 (API Port 8080)
    print("[MESH] Starting Node 1 (API Port 8080)...")
    env1 = os.environ.copy()
    env1["API_PORT"] = "8080"
    node1 = subprocess.Popen(["backend/target/debug/xrnet-backend"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, env=env1, **kwargs)

    # Start Node 2 (API Port 8081)
    print("[MESH] Starting Node 2 (API Port 8081)...")
    env2 = os.environ.copy()
    env2["API_PORT"] = "8081"
    node2 = subprocess.Popen(["backend/target/debug/xrnet-backend"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, env=env2, **kwargs)

    time.sleep(15)

    print("[MESH] Testing Message Propagation...")
    try:
        # Node 1 sends a message
        requests.post("http://127.0.0.1:8080/api/messages/send", json={"content": "MESH_BENCHMARK_SIGNAL_001"})
        time.sleep(5)

        # Check Node 2 for the message
        resp2 = requests.get("http://127.0.0.1:8081/api/messages/list")
        messages = resp2.json()
        found = any(m["content"] == "MESH_BENCHMARK_SIGNAL_001" for m in messages)

        if found:
            print("[SUCCESS] Gossipsub propagation verified between Node 1 and Node 2.")
        else:
            print("[FAILURE] Message did not reach Node 2.")
    except Exception as e:
        print(f"[ERROR] Benchmark test failed: {e}")

    # Cleanup
    print("[MESH] Cleaning up...")
    for proc in [node1, node2]:
        if os.name != 'nt':
            os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
        else:
            proc.terminate()
    peer.terminate()

    print("\n--- Benchmark Complete ---")

if __name__ == "__main__":
    simulate_mesh()
