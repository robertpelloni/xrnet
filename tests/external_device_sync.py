import requests
import time
import json
import os
import sys

def simulate_external_device():
    print("--- [SIM] XRNet External Device Simulation (AR Headset) ---")
    api_url = "http://127.0.0.1:8080"

    # 1. Join Mesh (Wait for local node)
    print("[SIM] Waiting for local XRNet node to be READY...")
    for _ in range(30):
        try:
            resp = requests.get(f"{api_url}/api/status", timeout=1)
            if resp.status_code == 200:
                print(f"[SIM] Connected to mesh node: {resp.json().get('peer_id')}")
                break
        except:
            pass
        time.sleep(1)
    else:
        print("[ERROR] Local node not found.")
        sys.exit(1)

    # 2. Publish Spatial Scan to DHT
    print("[SIM] Publishing photorealistic spatial scan to DHT...")
    scan_data = {
        "timestamp": int(time.time()),
        "device_type": "AR_HEADSET_PRO",
        "location": "living_room_coord_A1",
        "data_hash": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3hlgtv"
    }

    put_payload = {
        "key": f"spatial:scan:{int(time.time())}",
        "value": json.dumps(scan_data)
    }

    resp = requests.post(f"{api_url}/api/dht/put", json=put_payload)
    if resp.status_code == 200:
        print("[SIM] DHT PUT successful.")
    else:
        print(f"[ERROR] DHT PUT failed: {resp.text}")

    # 3. Verify Profile Discovery
    print("[SIM] Polling for mesh profiles...")
    time.sleep(2)
    resp = requests.get(f"{api_url}/api/profile")
    profiles = resp.json()
    print(f"[SIM] Discovered profiles: {list(profiles.values())}")

    print("[SIM] External device simulation complete.")

if __name__ == "__main__":
    simulate_external_device()
