import requests
import time
import json
import os
import sys

def simulate_external_device():
    print("--- [SIM] XRNet External Device Simulation (AR Headset) ---")
    api_url = "http://127.0.0.1:3000"

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

    # 4. Multi-hop Distance-Vector Routing & Telemetry Validation
    verify_multihop_routing_and_telemetry(api_url)

    print("[SIM] External device simulation complete.")

def verify_multihop_routing_and_telemetry(api_url):
    print("--- [SIM] Multi-Hop Distance-Vector Routing & Telemetry Validation ---")

    # Check DV route table inspection
    routes_resp = requests.get(f"{api_url}/api/routing/routes")
    if routes_resp.status_code != 200:
        print(f"[ERROR] Failed to query /api/routing/routes: {routes_resp.status_code}")
        sys.exit(1)
    routes = routes_resp.json()
    print(f"[SIM] Distance-Vector active routes: {len(routes)}")

    # Dispatch packet via multi-hop mesh routing
    dispatch_payload = {
        "source": "device-ar-1",
        "destination": "peer-alpha",
        "payload": "spatial-sync-test",
        "ttl": 16
    }
    dispatch_resp = requests.post(f"{api_url}/api/routing/dispatch", json=dispatch_payload)
    if dispatch_resp.status_code != 200:
        print(f"[ERROR] Routing dispatch failed: {dispatch_resp.text}")
        sys.exit(1)
    dispatch_data = dispatch_resp.json()
    print(f"[SIM] Routing dispatch result: {dispatch_data.get('status')} (forwarded: {dispatch_data.get('forwarded')})")

    # Verify Telemetry reporting
    telemetry_resp = requests.get(f"{api_url}/api/telemetry")
    if telemetry_resp.status_code != 200:
        print(f"[ERROR] Telemetry poll failed: {telemetry_resp.status_code}")
        sys.exit(1)
    telemetry = telemetry_resp.json()
    print(f"[SIM] Telemetry data: routes={telemetry.get('active_routes')}, jitter={telemetry.get('jitter_ms')}ms, loss={telemetry.get('packet_loss_percent')}%, packet_rate={telemetry.get('packet_rate')}")
    assert "jitter_ms" in telemetry, "Missing jitter_ms in telemetry"
    assert "packet_loss_percent" in telemetry, "Missing packet_loss_percent in telemetry"

if __name__ == "__main__":
    simulate_external_device()
