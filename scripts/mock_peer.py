import socket
import sys
import time
import json

def start_mock_peer(port=9000):
    sys.stdout.write(f"[MOCK-PEER] Starting on port {port}...\n")
    sys.stdout.flush()

    log_file = "central_telemetry.log"
    sys.stdout.write(f"[MOCK-PEER] Logging telemetry to {log_file}\n")
    sys.stdout.flush()

    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            s.bind(('127.0.0.1', port))
            s.listen()
            sys.stdout.write(f"[MOCK-PEER] Listening for xrnet connections...\n")
            sys.stdout.flush()

            while True:
                conn, addr = s.accept()
                with conn:
                    # Non-blocking-ish read
                    data = conn.recv(4096)
                    if not data:
                        continue

                    decoded = data.decode().strip()

                    if decoded == "XRNET_HANDSHAKE":
                        conn.sendall(b"XRNET_ACK")
                        sys.stdout.write(f"[MOCK-PEER] Handshake from {addr}\n")
                        sys.stdout.flush()
                    else:
                        # Attempt to parse as telemetry JSON
                        try:
                            # It might be multiple lines if multiple reports came in
                            for line in decoded.split('\n'):
                                if not line.strip(): continue
                                report = json.loads(line)
                                if report.get("type") == "TELEMETRY":
                                    with open(log_file, "a") as f:
                                        f.write(json.dumps(report) + "\n")
                                    sys.stdout.write(f"[MOCK-PEER] Telemetry from {report.get('peer_id')[:8]}: CPU {report.get('cpu'):.1f}%\n")
                                    sys.stdout.flush()
                        except json.JSONDecodeError:
                            sys.stdout.write(f"[MOCK-PEER] Received unknown data from {addr}: {decoded[:50]}...\n")
                            sys.stdout.flush()
    except Exception as e:
        sys.stdout.write(f"[MOCK-PEER] Error: {e}\n")
        sys.stdout.flush()
        sys.exit(1)

if __name__ == "__main__":
    start_mock_peer()
