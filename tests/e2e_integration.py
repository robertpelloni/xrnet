import unittest
import subprocess
import os
import time
import signal
import requests

class TestEndToEndIntegration(unittest.TestCase):
    def test_system_full_stack(self):
        """Verify that the backend API is functional and the system boots."""
        print("\n--- Running E2E Full Stack Integration Test ---")
        api_port = os.environ.get("API_PORT", "8080")
        api_url = f"http://127.0.0.1:{api_port}"

        # 1. Start the xrnet system
        kwargs = {}
        if os.name != 'nt':
            kwargs['preexec_fn'] = os.setpgrp

        process = subprocess.Popen(["./start.sh"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, **kwargs)

        # 2. Check Backend API (Wait for it to be ready, as it may re-build)
        print(f"[TEST] Waiting for API {api_url} to be ready (up to 120s)...")
        ready = False
        for _ in range(120):
            try:
                response = requests.get(f"{api_url}/api/status", timeout=1)
                if response.status_code == 200:
                    ready = True
                    break
            except:
                pass
            time.sleep(1)

        if not ready:
            self.fail(f"Backend API {api_url} did not become ready in time.")

        try:
            response = requests.get(f"{api_url}/api/status", timeout=5)
            self.assertEqual(response.status_code, 200)
            data = response.json()
            print(f"API Response: {data}")
            self.assertIn("peer_id", data)
            # Use a starts_with or just check existence since version bumps automatically
            self.assertTrue(data["version"].startswith("0."))
        except Exception as e:
            self.fail(f"Backend API not accessible: {e}")

        # Capture snapshots
        try:
            stdout, stderr = process.communicate(timeout=2)
        except subprocess.TimeoutExpired:
            if os.name != 'nt':
                os.killpg(os.getpgid(process.pid), signal.SIGTERM)
            else:
                process.terminate()
            stdout, stderr = process.communicate()

        print(f"XRNET STDOUT Snapshot:\n{stdout}")

        # Verify component launches
        self.assertIn("Starting xrnet", stdout)
        # Allow any 0.x.x version
        self.assertTrue("xrnet-backend v0." in stdout)
        self.assertIn(f"[API] Server listening on http://127.0.0.1:{api_port}", stdout)

        # Check for protocol execution (or skip)
        if "[COORD] Skipping Executive Autonomous Protocol" not in stdout:
            self.assertIn("[COORD] Executing Executive Autonomous Protocol...", stdout)
            self.assertIn("[COORD] Executive Protocol Successful.", stdout)

    def test_protocol_api(self):
        """Verify that the Executive Protocol API can be triggered."""
        print("\n--- Running Executive Protocol API Integration Test ---")
        api_port = os.environ.get("API_PORT", "8080")
        api_url = f"http://127.0.0.1:{api_port}"

        # Ensure system is running
        kwargs = {}
        if os.name != 'nt':
            kwargs['preexec_fn'] = os.setpgrp
        process = subprocess.Popen(["./start.sh"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, **kwargs)

        try:
            # Wait for API to be ready
            for _ in range(20):
                try:
                    if requests.get(f"{api_url}/api/status", timeout=1).status_code == 200:
                        break
                except:
                    pass
                time.sleep(1)

            response = requests.post(f"{api_url}/api/system/protocol", timeout=60)
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data["status"], "success")
            self.assertIn("EXECUTIVE PROTOCOL: COMPLETED", data["stdout"])
        finally:
            if os.name != 'nt':
                os.killpg(os.getpgid(process.pid), signal.SIGTERM)
            else:
                process.terminate()
            process.wait()

    def test_integrity(self):
        """Ensure project integrity is verified."""
        print("\n--- Running Integrity Check ---")
        result = subprocess.run(["python3", "scripts/validate_integrity.py"], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, f"Project integrity check failed. Error: {result.stderr}")

    def test_mesh_telemetry_reporting(self):
        """Verify that nodes report telemetry to the central server."""
        print("\n--- Running Mesh Telemetry Reporting Test ---")

        # 1. Start the central mock peer
        kwargs = {}
        if os.name != 'nt':
            kwargs['preexec_fn'] = os.setpgrp
        peer_proc = subprocess.Popen(["python3", "scripts/mock_peer.py"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, **kwargs)

        # 2. Start a backend node
        env = os.environ.copy()
        env["API_PORT"] = "8090"
        node_proc = subprocess.Popen(["backend/target/debug/xrnet-backend"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, env=env, **kwargs)

        try:
            # 3. Wait for the node to report (reports every 10s)
            print("[TEST] Waiting 25s for telemetry propagation...")
            time.sleep(25)

            # 4. Check central server API for the report
            response = requests.get("http://127.0.0.1:9001/api/mesh/status", timeout=5)
            self.assertEqual(response.status_code, 200)
            data = response.json()

            self.assertGreater(len(data), 0, "No peer telemetry found in central server.")
            # Check that at least one peer_id exists
            peer_ids = list(data.keys())
            self.assertGreater(len(peer_ids), 0)

            # Check telemetry fields
            history = data[peer_ids[0]]
            self.assertGreater(len(history), 0)
            latest = history[-1]
            self.assertIn("cpu", latest)
            self.assertIn("memory", latest)
            self.assertIn("peers", latest)
            print(f"[SUCCESS] Telemetry received for Peer {peer_ids[0][:8]}: CPU={latest['cpu']}%")

        finally:
            if os.name != 'nt':
                os.killpg(os.getpgid(node_proc.pid), signal.SIGTERM)
                os.killpg(os.getpgid(peer_proc.pid), signal.SIGTERM)
            else:
                node_proc.terminate()
                peer_proc.terminate()
            node_proc.wait()
            peer_proc.wait()

if __name__ == "__main__":
    unittest.main()
