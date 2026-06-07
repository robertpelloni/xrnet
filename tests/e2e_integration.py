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

        # 1. Start the xrnet system
        kwargs = {}
        if os.name != 'nt':
            kwargs['preexec_fn'] = os.setpgrp

        process = subprocess.Popen(["./start.sh"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, **kwargs)

        # Give it time to perform initialization
        time.sleep(12)

        # 2. Check Backend API
        try:
            response = requests.get("http://127.0.0.1:8080/api/status", timeout=5)
            self.assertEqual(response.status_code, 200)
            data = response.json()
            print(f"API Response: {data}")
            self.assertIn("peer_id", data)
            self.assertEqual(data["version"], "0.1.1")
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
        self.assertIn("xrnet-backend v0.1.1", stdout)
        self.assertIn("[API] Server listening on http://127.0.0.1:8080", stdout)
        self.assertIn("[COORD] Executing Autonomous Sync Protocol...", stdout)

    def test_sync_api(self):
        """Verify that the sync API can be triggered."""
        print("\n--- Running Sync API Integration Test ---")

        # Ensure system is running (assuming test_system_full_stack already ran or we start it here)
        # For simplicity in this environment, we start it.
        kwargs = {}
        if os.name != 'nt':
            kwargs['preexec_fn'] = os.setpgrp
        process = subprocess.Popen(["./start.sh"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, **kwargs)

        try:
            # Wait for API to be ready
            for _ in range(20):
                try:
                    if requests.get("http://127.0.0.1:8080/api/status", timeout=1).status_code == 200:
                        break
                except:
                    pass
                time.sleep(1)

            response = requests.post("http://127.0.0.1:8080/api/system/sync", timeout=30)
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data["status"], "success")
            self.assertIn("Repository synchronization complete.", data["stdout"])
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
