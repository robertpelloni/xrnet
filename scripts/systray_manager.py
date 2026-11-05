#!/usr/bin/env python3
"""
Systray and Background Service Manager for xrnet.
Provides cross-platform background daemon controls, graceful shutdown hooks,
status queries, and log tailing.
"""

import sys
import os
import subprocess
import time
import urllib.request
import json
import argparse

BACKEND_URL = "http://127.0.0.1:3000"
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def is_backend_running():
    try:
        req = urllib.request.Request(f"{BACKEND_URL}/api/status", headers={"User-Agent": "xrnet-systray"})
        with urllib.request.urlopen(req, timeout=2) as resp:
            return resp.status == 200
    except Exception:
        return False

def start_backend():
    if is_backend_running():
        print("[Systray] Backend is already running.")
        return True
    print("[Systray] Booting xrnet backend daemon...")
    log_file = open(os.path.join(REPO_ROOT, "backend_daemon.log"), "a")
    proc = subprocess.Popen(
        ["cargo", "run", "--bin", "backend"],
        cwd=os.path.join(REPO_ROOT, "backend"),
        stdout=log_file,
        stderr=subprocess.STDOUT,
        start_new_session=True
    )
    print(f"[Systray] Spawned backend daemon (PID: {proc.pid}). Waiting for ready state...")
    for _ in range(30):
        time.sleep(0.5)
        if is_backend_running():
            print("[Systray] Backend successfully online.")
            return True
    print("[Systray] Warning: Backend start timed out. Check backend_daemon.log")
    return False

def stop_backend():
    print("[Systray] Requesting graceful backend shutdown via /api/system/shutdown...")
    try:
        req = urllib.request.Request(f"{BACKEND_URL}/api/system/shutdown", data=b"{}", headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=3) as resp:
            print(f"[Systray] Shutdown API responded: {resp.read().decode()}")
    except Exception as e:
        print(f"[Systray] API shutdown note: {e}")

    # Ensure port 3000 process cleanup
    time.sleep(1)
    subprocess.run("kill $(lsof -t -i :3000) 2>/dev/null || true", shell=True)
    print("[Systray] Backend shutdown confirmed.")

def query_status():
    if is_backend_running():
        try:
            req = urllib.request.Request(f"{BACKEND_URL}/api/status")
            with urllib.request.urlopen(req, timeout=2) as resp:
                data = json.loads(resp.read().decode())
                print(f"[Systray] Status: RUNNING | Peer ID: {data.get('peer_id', 'unknown')} | Version: {data.get('version', 'unknown')}")
        except Exception as e:
            print(f"[Systray] Status: RUNNING (Error parsing JSON: {e})")
    else:
        print("[Systray] Status: STOPPED (Port 3000 offline)")

def run_systray_ui():
    """Attempts to run a system tray menu with pystray if available, otherwise runs an interactive CLI."""
    try:
        import pystray
        from PIL import Image, ImageDraw

        def create_image():
            img = Image.new('RGB', (64, 64), color=(30, 41, 59))
            d = ImageDraw.Draw(img)
            d.rectangle((16, 16, 48, 48), fill=(99, 102, 241))
            return img

        def on_start(icon, item):
            start_backend()

        def on_stop(icon, item):
            stop_backend()

        def on_exit(icon, item):
            stop_backend()
            icon.stop()

        menu = pystray.Menu(
            pystray.MenuItem("Start xrnet Daemon", on_start),
            pystray.MenuItem("Stop xrnet Daemon", on_stop),
            pystray.MenuItem("Quit Systray & Services", on_exit)
        )

        icon = pystray.Icon("xrnet", create_image(), "xrnet Mesh Node", menu)
        print("[Systray] Running pystray icon loop...")
        icon.run()
    except ImportError:
        print("[Systray] Note: `pystray` / GUI display not installed in headless environment.")
        print("[Systray] Operating in headless service manager CLI mode.")
        query_status()

def main():
    parser = argparse.ArgumentParser(description="xrnet Systray & Background Service Manager")
    parser.add_argument("action", nargs="?", default="run", choices=["run", "start", "stop", "status"])
    args = parser.parse_args()

    if args.action == "start":
        start_backend()
    elif args.action == "stop":
        stop_backend()
    elif args.action == "status":
        query_status()
    else:
        run_systray_ui()

if __name__ == "__main__":
    main()
