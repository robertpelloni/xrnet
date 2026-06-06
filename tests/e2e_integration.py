import unittest
import subprocess
import os

class TestEndToEndIntegration(unittest.TestCase):
    def test_system_boot(self):
        """Verify that the system can be started via start.sh and exits gracefully (or as expected)."""
        print("\n--- Running E2E System Boot Test ---")

        # We expect start.sh to run successfully
        result = subprocess.run(["./start.sh"], capture_output=True, text=True)

        print(f"STDOUT: {result.stdout}")

        self.assertEqual(result.returncode, 0, f"System failed to start correctly via start.sh. Error: {result.stderr}")
        self.assertIn("Starting xrnet", result.stdout)

    def test_integrity_before_boot(self):
        """Ensure project integrity is verified before full E2E test."""
        print("\n--- Running Integrity Check ---")
        result = subprocess.run(["python3", "scripts/validate_integrity.py"], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, f"Project integrity check failed. Error: {result.stderr}")

if __name__ == "__main__":
    unittest.main()
