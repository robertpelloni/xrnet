import requests
import time
import statistics
import json
import sys

def benchmark_mesh():
    print("--- [BENCH] XRNet Mesh Performance Benchmarking ---")
    api_url = "http://127.0.0.1:8080"

    # 1. API Responsiveness
    print("[BENCH] Measuring API latency (100 samples)...")
    latencies = []
    for _ in range(100):
        start = time.perf_counter()
        requests.get(f"{api_url}/api/status")
        latencies.append((time.perf_counter() - start) * 1000)

    avg_api = statistics.mean(latencies)
    p95_api = statistics.quantiles(latencies, n=20)[18] # 95th percentile
    print(f"  Avg: {avg_api:.2f}ms, P95: {p95_api:.2f}ms")

    # 2. DHT PUT Throughput
    print("[BENCH] Measuring DHT PUT performance (50 records)...")
    put_latencies = []
    for i in range(50):
        start = time.perf_counter()
        requests.post(f"{api_url}/api/dht/put", json={"key": f"bench:{i}", "value": "data"})
        put_latencies.append((time.perf_counter() - start) * 1000)

    avg_put = statistics.mean(put_latencies)
    print(f"  Avg PUT Latency: {avg_put:.2f}ms")

    # 3. Mesh Messaging (Local Loopback Propagation)
    print("[BENCH] Measuring Mesh Message propagation...")
    msg_latencies = []
    for i in range(10):
        start = time.perf_counter()
        requests.post(f"{api_url}/api/messages/send", json={"content": f"bench_msg_{i}"})
        msg_latencies.append((time.perf_counter() - start) * 1000)

    avg_msg = statistics.mean(msg_latencies)
    print(f"  Avg MSG Latency: {avg_msg:.2f}ms")

    # Report
    report = {
        "timestamp": int(time.time()),
        "api_latency": {"avg": avg_api, "p95": p95_api},
        "dht_put_latency_avg": avg_put,
        "mesh_msg_latency_avg": avg_msg
    }

    with open("performance_report.json", "w") as f:
        json.dump(report, f, indent=2)

    print("[BENCH] Performance report generated: performance_report.json")

if __name__ == "__main__":
    benchmark_mesh()
