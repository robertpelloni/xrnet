import unittest
import subprocess
import os
import time
import signal

class TestEndToEndIntegration(unittest.TestCase):
    def test_system_boot_and_p2p_initialization(self):
        """Verify that the system starts and the libp2p node initializes."""
        print("\n--- Running E2E libp2p Node Initialization Test ---")

        # 1. Clean status file if exists
        if os.path.exists("backend/status.json"):
            os.remove("backend/status.json")

        # 2. Start the xrnet system
        kwargs = {}
        if os.name != 'nt':
            kwargs['preexec_fn'] = os.setpgrp

        process = subprocess.Popen(["./start.sh"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, **kwargs)

        # Give it time to perform initialization
        time.sleep(10)

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
        self.assertIn("xrnet-backend v0.1.0", stdout)

        # Verify libp2p Node initialization
        self.assertIn("[PROTOCOL] Local Peer ID:", stdout)
        self.assertIn("[PROTOCOL] Listening on", stdout)
        self.assertIn("[STATUS] READY", stdout)
        self.assertIn("[COORD] Everything Protocol detected as READY", stdout)

    def test_integrity(self):
        """Ensure project integrity is verified."""
        print("\n--- Running Integrity Check ---")
        result = subprocess.run(["python3", "scripts/validate_integrity.py"], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, f"Project integrity check failed. Error: {result.stderr}")

if __name__ == "__main__":
    unittest.main()
