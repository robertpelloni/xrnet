import unittest
import subprocess
import os
import time
import signal

class TestEndToEndIntegration(unittest.TestCase):
    def test_system_boot_and_protocol_handshake(self):
        """Verify that the system starts and the protocol performs its handshake."""
        print("\n--- Running E2E Protocol Handshake Test ---")

        # Start the system in the background
        kwargs = {}
        if os.name != 'nt':
            kwargs['preexec_fn'] = os.setpgrp

        process = subprocess.Popen(["./start.sh"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, **kwargs)

        # Give it a few seconds to perform initialization
        time.sleep(6)

        # Capture a snapshot of the output
        try:
            stdout, stderr = process.communicate(timeout=2)
        except subprocess.TimeoutExpired:
            if os.name != 'nt':
                os.killpg(os.getpgid(process.pid), signal.SIGTERM)
            else:
                process.terminate()
            stdout, stderr = process.communicate()

        print(f"STDOUT Snapshot:\n{stdout}")

        # Verify component launches
        self.assertIn("Starting xrnet", stdout)
        self.assertIn("xrnet-backend v0.1.0", stdout)
        self.assertIn("xrnet is now fully operational", stdout)

        # Verify Protocol specific logs (Handshake)
        self.assertIn("[PROTOCOL] Starting P2P node", stdout)
        self.assertIn("[PROTOCOL] Joining Distributed Hash Table", stdout)
        self.assertIn("[PROTOCOL] Connected to 42 peers", stdout)
        self.assertIn("[STATUS] READY", stdout)

        # Verify Coordination
        self.assertIn("[COORD] Waiting for Everything Protocol", stdout)
        self.assertIn("[COORD] Everything Protocol detected as READY", stdout)

    def test_integrity(self):
        """Ensure project integrity is verified."""
        print("\n--- Running Integrity Check ---")
        result = subprocess.run(["python3", "scripts/validate_integrity.py"], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, f"Project integrity check failed. Error: {result.stderr}")

if __name__ == "__main__":
    unittest.main()
