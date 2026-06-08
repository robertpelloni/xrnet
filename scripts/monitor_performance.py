import requests
import time
import json
import psutil
import os

def monitor_performance(duration_secs=30, interval_secs=5):
    print(f"--- [MONITOR] Performance monitoring started (Duration: {duration_secs}s) ---")
    log_file = "performance.log"

    with open(log_file, "w") as f:
        f.write("timestamp,cpu_percent,mem_percent,uptime_secs,peers,msg_sent,msg_recv\n")

    start_time = time.time()
    while time.time() - start_time < duration_secs:
        try:
            # System metrics
            cpu = psutil.cpu_percent()
            mem = psutil.virtual_memory().percent

            # Application metrics from Backend API
            response = requests.get("http://127.0.0.1:8080/api/status", timeout=2)
            data = response.json()

            uptime = data.get("uptime_secs", 0)
            peers = data.get("peers", 0)
            sent = data.get("messages_sent", 0)
            recv = data.get("messages_received", 0)

            timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
            log_line = f"{timestamp},{cpu},{mem},{uptime},{peers},{sent},{recv}"
            print(f"[MONITOR] {log_line}")

            with open(log_file, "a") as f:
                f.write(log_line + "\n")

        except Exception as e:
            print(f"[MONITOR] Error collecting metrics: {e}")

        time.sleep(interval_secs)

    print(f"--- [MONITOR] Performance monitoring complete. Log saved to {log_file} ---")

if __name__ == "__main__":
    monitor_performance()
