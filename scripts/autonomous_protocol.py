import os
import sys
import subprocess
import time
from datetime import datetime

def log(msg):
    print(f"[PROTOCOL] {msg}")
    sys.stdout.flush()

def run_cmd(cmd, cwd="."):
    log(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if result.returncode != 0:
        log(f"FAILED: {result.stderr}")
    return result

def step_sync():
    log("--- SECTION 2: REPO & GIT SANITIZATION ---")
    run_cmd(["sh", "./scripts/sync_repo.sh"])

def step_analysis():
    log("--- SECTION 3: RE-ANALYSIS & ROADMAP EXTRACTION ---")
    # Simulate scanning for gaps
    gaps = []
    if not os.path.exists("spatial/models"):
        gaps.append("Missing spatial AI models directory.")

    with open("TODO.md", "a") as f:
        f.write(f"\n# Protocol Analysis {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        for gap in gaps:
            f.write(f"- [ ] {gap}\n")
    log("Analysis complete. Updated TODO.md.")

def step_documentation():
    log("--- SECTION 4: CORE DOCUMENTATION & VERSIONING ---")
    # Centralized version bump logic
    try:
        with open("VERSION.md", "r") as f:
            v = f.read().strip().split('.')
            v[-1] = str(int(v[-1]) + 1)
            new_version = ".".join(v)
        with open("VERSION.md", "w") as f:
            f.write(new_version)

        with open("CHANGELOG.md", "a") as f:
            f.write(f"\n## [{new_version}] - {datetime.now().strftime('%Y-%m-%d')}\n")
            f.write("- Autonomous version bump via Executive Protocol.\n")
        log(f"Version bumped to {new_version}.")
    except Exception as e:
        log(f"Versioning failed: {e}")

def step_build():
    log("--- STEP 3: WORKSPACE CLEANUP & BUILD ---")
    run_cmd(["./build.sh"])

def main():
    log("=== EXECUTIVE PROTOCOL: AUTONOMOUS ENGINE STARTING ===")
    step_sync()
    step_analysis()
    step_documentation()
    step_build()
    log("=== EXECUTIVE PROTOCOL: COMPLETED ===")

if __name__ == "__main__":
    main()
