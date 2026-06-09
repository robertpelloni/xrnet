import unittest
import subprocess
import os
import time
import signal
import requests
import json

class TestMonitoringIntegration(unittest.TestCase):
    """Integration tests for the Monitoring module (Telemetry and Reporting)."""

    def setUp(self):
        self.nodes = []
        self.central_server = None
        self.kwargs = {}
        if os.name != 'nt':
            self.kwargs['preexec_fn'] = os.setpgrp

        # Start Central Control Server
        print("[SETUP] Starting Central Control Server...")
        self.central_server = subprocess.Popen(["python3", "scripts/mock_peer.py"],
                                             stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, **self.kwargs)
        time.sleep(2)

    def tearDown(self):
        print("[TEARDOWN] Terminating all nodes...")
        for node in self.nodes:
            if os.name != 'nt':
                try:
                    os.killpg(os.getpgid(node['proc'].pid), signal.SIGTERM)
                except:
                    pass
            else:
                node['proc'].terminate()

        if self.central_server:
            if os.name != 'nt':
                try:
                    os.killpg(os.getpgid(self.central_server.pid), signal.SIGTERM)
                except:
                    pass
            else:
                self.central_server.terminate()
        print("[TEARDOWN] Done.")

    def start_node(self, index, api_port):
        print(f"[NODE] Starting Node {index} on API port {api_port}...")
        env = os.environ.copy()
        env["API_PORT"] = str(api_port)
        binary = "backend/target/debug/xrnet-backend"
        if not os.path.exists(binary):
            self.fail(f"Backend binary not found at {binary}")

        proc = subprocess.Popen([binary], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, env=env, **self.kwargs)
        node = {"proc": proc, "port": api_port}
        self.nodes.append(node)

        # Wait for API to be ready
        url = f"http://127.0.0.1:{api_port}/api/status"
        for _ in range(30):
            try:
                if requests.get(url, timeout=1).status_code == 200:
                    return node
            except:
                pass
            time.sleep(1)
        self.fail(f"Node on port {api_port} failed to become ready.")

    def test_local_telemetry_accuracy(self):
        """Verify that local telemetry is polled and reported correctly."""
        print("\n--- Running Local Telemetry Accuracy Test ---")
        node = self.start_node(1, 8080)

        # Check initial status
        resp = requests.get("http://127.0.0.1:8080/api/status", timeout=5)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        self.assertIn("cpu_usage", data)
        self.assertIn("memory_usage", data)

        self.assertIsInstance(data["cpu_usage"], (int, float))
        self.assertIsInstance(data["memory_usage"], (int, float))

        print(f"[TEST] Observed Local Metrics: CPU={data['cpu_usage']}%, MEM={data['memory_usage']}%")
        print("[SUCCESS] Local telemetry verified.")

    def test_mesh_wide_telemetry_aggregation(self):
        """Verify that the central monitor correctly aggregates data from multiple nodes."""
        print("\n--- Running Mesh-Wide Telemetry Aggregation Test ---")

        self.start_node(1, 8080)
        self.start_node(2, 8081)
        self.start_node(3, 8082)

        print("[TEST] Waiting 25s for telemetry reporting cycles...")
        time.sleep(25)

        try:
            resp = requests.get("http://127.0.0.1:9001/api/mesh/status", timeout=5)
            self.assertEqual(resp.status_code, 200)
            mesh_status = resp.json()

            peer_ids = list(mesh_status.keys())
            print(f"[TEST] Reporting Peer IDs: {peer_ids}")

            self.assertGreaterEqual(len(peer_ids), 3, "Central monitor did not aggregate data from all 3 nodes.")

        except Exception as e:
            self.fail(f"Failed to query central monitor: {e}")

        print("[SUCCESS] Mesh-wide telemetry aggregation verified.")

if __name__ == "__main__":
    unittest.main()
