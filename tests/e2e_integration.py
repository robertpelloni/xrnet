import unittest
import subprocess
import os
import time
import signal

class TestEndToEndIntegration(unittest.TestCase):
    def test_system_boot_and_external_handshake(self):
        """Verify that the system starts and successfully handshakes with an external peer."""
        print("\n--- Running E2E External Handshake Test ---")

        # 1. Start the Mock Peer
        mock_peer = subprocess.Popen(["python3", "scripts/mock_peer.py"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

        # 2. Start the xrnet system
        kwargs = {}
        if os.name != 'nt':
            kwargs['preexec_fn'] = os.setpgrp

        process = subprocess.Popen(["./start.sh"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, **kwargs)

        # Give it time to perform initialization and handshake
        time.sleep(8)

        # Capture snapshots
        try:
            stdout, stderr = process.communicate(timeout=2)
        except subprocess.TimeoutExpired:
            if os.name != 'nt':
                os.killpg(os.getpgid(process.pid), signal.SIGTERM)
            else:
                process.terminate()
            stdout, stderr = process.communicate()

        mock_peer.terminate()
        mock_stdout, mock_stderr = mock_peer.communicate()

        print(f"XRNET STDOUT Snapshot:\n{stdout}")
        print(f"MOCK-PEER STDOUT Snapshot:\n{mock_stdout}")

        # Verify component launches
        self.assertIn("Starting xrnet", stdout)
        self.assertIn("xrnet-backend v0.1.0", stdout)

        # Verify External Handshake in logs
        self.assertIn("[PROTOCOL] Connected to external peer", stdout)
        self.assertIn("[PROTOCOL] Handshake with external system successful", stdout)
        self.assertIn("[PROTOCOL] Connected to external network and 43 peers", stdout)

        self.assertIn("[MOCK-PEER] Handshake complete", mock_stdout)

    def test_integrity(self):
        """Ensure project integrity is verified."""
        print("\n--- Running Integrity Check ---")
        result = subprocess.run(["python3", "scripts/validate_integrity.py"], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, f"Project integrity check failed. Error: {result.stderr}")

if __name__ == "__main__":
    unittest.main()
