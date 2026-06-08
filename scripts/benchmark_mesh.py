import subprocess
import time
import os
import signal
import requests
import json
import argparse

def benchmark_mesh(node_count=5, duration=60):
    print("========================================")
    print(f"      xrnet - MESH BENCHMARK ({node_count} Nodes)     ")
    print("========================================\n")

    # Ensure central server is running
    print("[BENCH] Starting Central Control Server...")
    central_server = subprocess.Popen(["python3", "scripts/mock_peer.py"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    time.sleep(2)

    nodes = []
    kwargs = {}
    if os.name != 'nt':
        kwargs['preexec_fn'] = os.setpgrp

    # Spawn nodes
    for i in range(node_count):
        port = 8080 + i
        print(f"[BENCH] Starting Node {i+1} on API port {port}...")
        env = os.environ.copy()
        env["API_PORT"] = str(port)
        # Use release if available, fallback to debug
        binary = "backend/target/release/xrnet-backend"
        if not os.path.exists(binary):
            binary = "backend/target/debug/xrnet-backend"

        proc = subprocess.Popen([binary], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, env=env, **kwargs)
        nodes.append({"proc": proc, "port": port})

    print(f"[BENCH] Waiting 20s for mesh stabilization and discovery...")
    time.sleep(20)

    print(f"[BENCH] Starting Load Simulation for {duration}s...")
    start_time = time.time()
    msg_count = 0

    try:
        while time.time() - start_time < duration:
            # Randomly pick a node to send a message
            target_node = nodes[msg_count % node_count]
            try:
                requests.post(f"http://127.0.0.1:{target_node['port']}/api/messages/send",
                              json={"content": f"BENCH_LOAD_MSG_{msg_count}"},
                              timeout=1)
                msg_count += 1
            except:
                pass

            # Randomly pick a node to put a DHT record
            target_node = nodes[(msg_count + 1) % node_count]
            try:
                requests.post(f"http://127.0.0.1:{target_node['port']}/api/dht/put",
                              json={"key": f"bench:key:{msg_count}", "value": f"bench:val:{msg_count}"},
                              timeout=1)
            except:
                pass

            if msg_count % 10 == 0:
                print(f"[BENCH] Load Progress: {msg_count} operations injected...")

            time.sleep(1)

    except KeyboardInterrupt:
        print("[BENCH] Interrupted by user.")

    print(f"\n[BENCH] Load Simulation Complete. Total messages injected: {msg_count}")

    # Final check: Pick a random node and see how many messages it received
    try:
        sample_node = nodes[-1]
        resp = requests.get(f"http://127.0.0.1:{sample_node['port']}/api/status")
        stats = resp.json()
        print(f"[BENCH] Node {node_count} Stats: Sent={stats.get('messages_sent')}, Recv={stats.get('messages_received')}")
    except:
        print("[BENCH] Could not retrieve final stats.")

    # Cleanup
    print("[BENCH] Terminating all nodes...")
    for node in nodes:
        if os.name != 'nt':
            try:
                os.killpg(os.getpgid(node['proc'].pid), signal.SIGTERM)
            except:
                pass
        else:
            node['proc'].terminate()

    central_server.terminate()
    print("[BENCH] Benchmark Cleanup Complete.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--nodes", type=int, default=3)
    parser.add_argument("--duration", type=int, default=45)
    args = parser.parse_args()

    benchmark_mesh(node_count=args.nodes, duration=args.duration)
