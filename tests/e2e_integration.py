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
            self.assertTrue(data["version"].startswith("0.2."))
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
        # Allow any 0.2.x version
        self.assertTrue("xrnet-backend v0.2." in stdout)
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

if __name__ == "__main__":
    unittest.main()
