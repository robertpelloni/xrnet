import socket
import sys
import time
import json
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler

# In-memory store for active mesh telemetry
mesh_state = {}
mesh_alerts = []
state_lock = threading.Lock()

class MeshAPIHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/mesh/status":
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            with state_lock:
                # Cleanup old alerts (older than 5 mins)
                now = time.time()
                global mesh_alerts
                mesh_alerts = [a for a in mesh_alerts if now - a['timestamp'] < 300]

                response = {
                    "peers": mesh_state,
                    "alerts": mesh_alerts
                }
                self.wfile.write(json.dumps(response).encode())
        elif self.path == "/" or self.path == "/index.html":
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            try:
                with open("scripts/mesh_dashboard.html", "rb") as f:
                    self.wfile.write(f.read())
            except FileNotFoundError:
                self.wfile.write(b"<h1>Mesh Dashboard Not Found</h1>")
        else:
            self.send_response(404)
            self.end_headers()

def run_http_server(port=9001):
    server = HTTPServer(('0.0.0.0', port), MeshAPIHandler)
    sys.stdout.write(f"[MOCK-PEER] Mesh Dashboard API at http://localhost:{port}/api/mesh/status\n")
    sys.stdout.flush()
    server.serve_forever()

def start_mock_peer(port=9000):
    sys.stdout.write(f"[MOCK-PEER] Starting Central Control on port {port}...\n")
    sys.stdout.flush()

    log_file = "central_telemetry.log"

    # Start HTTP API in background
    threading.Thread(target=run_http_server, daemon=True).start()

    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            s.bind(('127.0.0.1', port))
            s.listen()
            sys.stdout.write(f"[MOCK-PEER] Listening for xrnet telemetry...\n")
            sys.stdout.flush()

            while True:
                conn, addr = s.accept()
                with conn:
                    data = conn.recv(4096)
                    if not data:
                        continue

                    decoded = data.decode().strip()

                    if decoded == "XRNET_HANDSHAKE":
                        conn.sendall(b"XRNET_ACK")
                    else:
                        try:
                            for line in decoded.split('\n'):
                                if not line.strip(): continue
                                report = json.loads(line)
                                if report.get("type") == "TELEMETRY":
                                    peer_id = report.get("peer_id")
                                    cpu = report.get("cpu", 0)
                                    mem = report.get("memory", 0)

                                    with state_lock:
                                        # Analytics: Alerts logic
                                        if cpu > 80:
                                            mesh_alerts.append({
                                                "peer_id": peer_id,
                                                "type": "CRITICAL",
                                                "message": f"High CPU usage: {cpu:.1f}%",
                                                "timestamp": time.time()
                                            })
                                        if mem > 90:
                                            mesh_alerts.append({
                                                "peer_id": peer_id,
                                                "type": "WARNING",
                                                "message": f"High Memory usage: {mem:.1f}%",
                                                "timestamp": time.time()
                                            })

                                        # Keep track of last 20 data points per peer for analytics
                                        if peer_id not in mesh_state:
                                            mesh_state[peer_id] = []
                                        mesh_state[peer_id].append(report)
                                        mesh_state[peer_id] = mesh_state[peer_id][-20:]

                                    with open(log_file, "a") as f:
                                        f.write(json.dumps(report) + "\n")
                        except json.JSONDecodeError:
                            pass
    except Exception as e:
        sys.stdout.write(f"[MOCK-PEER] Error: {e}\n")
        sys.stdout.flush()
        sys.exit(1)

if __name__ == "__main__":
    start_mock_peer()
