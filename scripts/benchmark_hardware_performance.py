import requests
import time
import os
import subprocess
import signal

def log(msg):
    print(f"[HW-BENCH] {msg}")

def run_hardware_benchmark(duration=60):
    log("--- Starting Hardware Integration & Performance Benchmark ---")

    # 1. Start the backend in release mode if possible
    binary = "backend/target/release/xrnet-backend"
    if not os.path.exists(binary):
        binary = "backend/target/debug/xrnet-backend"

    log(f"Using binary: {binary}")

    kwargs = {'preexec_fn': os.setpgrp} if os.name != 'nt' else {}
    proc = subprocess.Popen([binary], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, **kwargs)

    time.sleep(10) # Initial boot

    api_port = os.environ.get("API_PORT", "8080")
    api_url = f"http://127.0.0.1:{api_port}/api/status"

    start_time = time.time()
    latencies = []

    log(f"Collecting metrics for {duration}s...")

    try:
        while time.time() - start_time < duration:
            t0 = time.time()
            try:
                resp = requests.get(api_url, timeout=2)
                if resp.status_code == 200:
                    latencies.append(time.time() - t0)
            except Exception as e:
                log(f"Request failed: {e}")

            time.sleep(1)

    except KeyboardInterrupt:
        pass
    finally:
        os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
        proc.wait()

    if latencies:
        avg_lat = sum(latencies) / len(latencies)
        max_lat = max(latencies)
        log(f"Average API Latency: {avg_lat*1000:.2f}ms")
        log(f"Peak API Latency: {max_lat*1000:.2f}ms")

        if avg_lat < 0.1: # 100ms
            log("[OK] Hardware response time is within production specs.")
        else:
            log("[WARN] Hardware response time exceeded target (100ms).")
    else:
        log("[ERROR] No data collected.")

if __name__ == "__main__":
    run_hardware_benchmark()
