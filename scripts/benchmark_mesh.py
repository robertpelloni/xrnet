import subprocess
import time
import os
import signal
import requests
import json
import argparse

def benchmark_mesh(node_count=5, duration=60, output_log=None):
    print("========================================")
    print(f"      xrnet - MESH BENCHMARK ({node_count} Nodes)     ")
    print("========================================\n")

    # Ensure central server is running
    print("[BENCH] Starting Central Control Server...")
    central_server = subprocess.Popen(["python3", "scripts/mock_peer.py"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    time.sleep(3)

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
        env["SKIP_VERSION_BUMP"] = "1"
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
    latencies = []

    try:
        while time.time() - start_time < duration:
            # Randomly pick a node to send a message
            target_node = nodes[msg_count % node_count]
            op_start = time.time()
            try:
                requests.post(f"http://127.0.0.1:{target_node['port']}/api/messages/send",
                              json={"content": f"BENCH_LOAD_MSG_{msg_count}"},
                              timeout=2)
                latencies.append(time.time() - op_start)
                msg_count += 1
            except Exception as e:
                print(f"[BENCH] Op failed: {e}")

            # Randomly pick a node to put a DHT record
            target_node = nodes[(msg_count + 1) % node_count]
            try:
                requests.post(f"http://127.0.0.1:{target_node['port']}/api/dht/put",
                              json={"key": f"bench:key:{msg_count}", "value": f"bench:val:{msg_count}"},
                              timeout=2)
            except:
                pass

            if msg_count % 10 == 0 and msg_count > 0:
                avg_lat = sum(latencies) / len(latencies) if latencies else 0
                print(f"[BENCH] Load Progress: {msg_count} ops, Avg Latency: {avg_lat*1000:.2f}ms")

            time.sleep(0.5)

    except KeyboardInterrupt:
        print("[BENCH] Interrupted by user.")

    total_duration = time.time() - start_time
    throughput = msg_count / total_duration if total_duration > 0 else 0
    avg_latency = sum(latencies) / len(latencies) if latencies else 0

    results = {
        "node_count": node_count,
        "total_ops": msg_count,
        "throughput_ops_sec": throughput,
        "avg_latency_ms": avg_latency * 1000
    }

    print(f"\n[BENCH] Results for {node_count} nodes:")
    print(f"  Throughput: {throughput:.2f} ops/sec")
    print(f"  Avg Latency: {avg_latency*1000:.2f} ms")

    if output_log:
        with open(output_log, "a") as f:
            f.write(json.dumps(results) + "\n")

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
    return results

def run_scalability_test():
    log_file = "scalability_report.json"
    if os.path.exists(log_file):
        os.remove(log_file)

    for count in [3, 5, 8]:
        benchmark_mesh(node_count=count, duration=30, output_log=log_file)
        print(f"\n--- Cooling down between runs ---")
        time.sleep(10)

    print(f"\n[BENCH] Scalability Test Complete. Report saved to {log_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--nodes", type=int, default=3)
    parser.add_argument("--duration", type=int, default=45)
    parser.add_argument("--scalability", action="store_true")
    args = parser.parse_args()

    if args.scalability:
        run_scalability_test()
    else:
        benchmark_mesh(node_count=args.nodes, duration=args.duration)
