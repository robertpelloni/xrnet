import unittest
import subprocess
import os
import time
import signal

class TestEndToEndIntegration(unittest.TestCase):
    def test_system_boot(self):
        """Verify that the system can be started via start.sh and processes are launched."""
        print("\n--- Running E2E System Boot Test ---")

        # Start the system in the background
        # Use a process group if possible for cleanup, but avoid preexec_fn=os.setsid for better portability if needed
        # subprocess.CREATE_NEW_PROCESS_GROUP is Windows specific, so we'll stick to a cross-platform approach where possible
        kwargs = {}
        if os.name != 'nt':
            kwargs['preexec_fn'] = os.setpgrp

        process = subprocess.Popen(["./start.sh"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, **kwargs)

        # Give it a few seconds to start
        time.sleep(5)

        # Capture a snapshot of the output
        try:
            stdout, stderr = process.communicate(timeout=2)
        except subprocess.TimeoutExpired:
            # This is expected since start.sh waits
            if os.name != 'nt':
                os.killpg(os.getpgid(process.pid), signal.SIGTERM)
            else:
                process.terminate()
            stdout, stderr = process.communicate()

        print(f"STDOUT Snapshot:\n{stdout}")

        self.assertIn("Starting xrnet", stdout)
        self.assertIn("xrnet-backend v0.1.0", stdout)
        self.assertIn("xrnet is now running", stdout)
        self.assertIn("xrnet processes started", stdout)

    def test_integrity_before_boot(self):
        """Ensure project integrity is verified."""
        print("\n--- Running Integrity Check ---")
        result = subprocess.run(["python3", "scripts/validate_integrity.py"], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, f"Project integrity check failed. Error: {result.stderr}")

if __name__ == "__main__":
    unittest.main()
