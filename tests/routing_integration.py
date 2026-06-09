import unittest
import subprocess
import os
import time
import signal
import requests
import json

class TestRoutingIntegration(unittest.TestCase):
    """Integration tests for the Routing module (Gossipsub and DHT)."""

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

    def test_mesh_messaging(self):
        """Verify that messages sent via Gossipsub are received by peers."""
        print("\n--- Running Mesh Messaging Integration Test ---")
        node1 = self.start_node(1, 8080)
        node2 = self.start_node(2, 8081)

        print("[TEST] Waiting 15s for mesh discovery and stabilization...")
        time.sleep(15)

        # Node 1 sends a message
        test_msg = f"INTEGRATION_TEST_MSG_{int(time.time())}"
        print(f"[TEST] Node 1 sending message: {test_msg}")
        resp = requests.post(f"http://127.0.0.1:8080/api/messages/send", json={"content": test_msg}, timeout=5)
        self.assertEqual(resp.status_code, 200)

        # Node 2 should receive it
        print("[TEST] Waiting for Node 2 to receive message...")
        received = False
        for _ in range(10):
            try:
                resp = requests.get(f"http://127.0.0.1:8081/api/messages/list", timeout=2)
                msgs = resp.json()
                if any(m['content'] == test_msg for m in msgs):
                    received = True
                    break
            except Exception as e:
                print(f"[DEBUG] Error checking messages: {e}")
            time.sleep(2)

        self.assertTrue(received, "Node 2 did not receive the Gossipsub message from Node 1.")
        print("[SUCCESS] Mesh messaging verified.")

    def test_dht_record_sync(self):
        """Verify Kademlia record propagation across the mesh."""
        print("\n--- Running DHT Record Sync Integration Test ---")
        node1 = self.start_node(1, 8080)
        node2 = self.start_node(2, 8081)

        print("[TEST] Waiting 15s for mesh stabilization...")
        time.sleep(15)

        profile_key = f"profile:integration_test_user"
        profile_alias = "SyncTester"
        print(f"[TEST] Node 1 publishing profile: {profile_key}")
        requests.post(f"http://127.0.0.1:8080/api/dht/put", json={"key": profile_key, "value": profile_alias}, timeout=5)

        # Node 2 GET
        requests.get(f"http://127.0.0.1:8081/api/dht/get?key={profile_key}", timeout=5)

        synced = False
        for _ in range(20):
            try:
                resp = requests.get(f"http://127.0.0.1:8081/api/profile", timeout=2)
                profiles = resp.json()
                if profile_key in profiles and profiles[profile_key] == profile_alias:
                    synced = True
                    break
            except:
                pass
            time.sleep(2)

        self.assertTrue(synced, "Node 2 did not sync the DHT record from Node 1.")
        print("[SUCCESS] DHT record sync verified.")

if __name__ == "__main__":
    unittest.main()
