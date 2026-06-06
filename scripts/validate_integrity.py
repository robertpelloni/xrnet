import os
import sys

def check_file(path):
    if os.path.isfile(path):
        print(f"[OK] Found {path}")
        return True
    else:
        print(f"[FAIL] Missing {path}")
        return False

def check_dir(path):
    if os.path.isdir(path):
        print(f"[OK] Found directory {path}")
        return True
    else:
        print(f"[FAIL] Missing directory {path}")
        return False

def validate_versioning():
    try:
        with open("VERSION.md", "r") as f:
            version = f.read().strip()

        with open("CHANGELOG.md", "r") as f:
            changelog = f.read()

        if f"[{version}]" in changelog:
            print(f"[OK] Version {version} found in CHANGELOG.md")
            return True
        else:
            print(f"[FAIL] Version {version} NOT found in CHANGELOG.md")
            return False
    except Exception as e:
        print(f"[FAIL] Version validation error: {e}")
        return False

def main():
    required_files = [
        "VISION.md", "MEMORY.md", "ROADMAP.md", "TODO.md",
        "DEPLOY.md", "IDEAS.md", "CHANGELOG.md", "VERSION.md",
        "HANDOFF.md", ".gitignore"
    ]
    required_dirs = ["backend", "frontend", "spatial"]

    success = True

    print("--- Verifying Files ---")
    for f in required_files:
        if not check_file(f):
            success = False

    print("\n--- Verifying Directories ---")
    for d in required_dirs:
        if not check_dir(d):
            success = False

    print("\n--- Verifying Version Consistency ---")
    if not validate_versioning():
        success = False

    if success:
        print("\n[SUCCESS] Integration validation passed!")
        sys.exit(0)
    else:
        print("\n[FAILURE] Integration validation failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
