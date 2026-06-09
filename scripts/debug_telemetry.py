import socket
import json
import time

def debug():
    try:
        report = {"type": "TELEMETRY", "peer_id": "debug_peer", "cpu": 50.0, "memory": 50.0, "peers": 0}
        print("Connecting to 127.0.0.1:9000...")
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.connect(("127.0.0.1", 9000))
            payload = json.dumps(report) + "\n"
            print(f"Sending: {payload.strip()}")
            s.sendall(payload.encode())
        print("Sent successfully.")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    debug()
