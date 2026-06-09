import socket
import json
import time
import requests

def test_telemetry():
    # 1. Start mock peer
    import subprocess
    import os
    kwargs = {}
    if os.name != 'nt':
        kwargs['preexec_fn'] = os.setpgrp

    peer_proc = subprocess.Popen(["python3", "scripts/mock_peer.py"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, **kwargs)
    time.sleep(2)

    try:
        # 2. Manual report
        report = {"type": "TELEMETRY", "peer_id": "test_peer", "cpu": 10.0, "memory": 20.0, "peers": 1, "timestamp": int(time.time())}
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.connect(("127.0.0.1", 9000))
            s.sendall((json.dumps(report) + "\n").encode())

        time.sleep(2)

        # 3. Check API
        resp = requests.get("http://127.0.0.1:9001/api/mesh/status")
        print(f"API Response: {resp.json()}")

    finally:
        os.killpg(os.getpgid(peer_proc.pid), 9)

if __name__ == "__main__":
    test_telemetry()
