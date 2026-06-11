import requests
import time
import json
import sys

def simulate_external_integration():
    print("--- [STAGING] External Device Integration Simulation ---")

    # 1. Join the mesh as a "Mobile Headset" simulator
    # We use Node 1 (8080) as our gateway
    GATEWAY_URL = "http://localhost:8080"
    EXTERNAL_DEVICE_ID = "DEVICE_AR_HEADSET_001"

    print(f"[DEVICE] Joining mesh via gateway {GATEWAY_URL}...")

    # 2. Publish Spatial Data to DHT
    spatial_record = {
        "key": f"spatial:scan:{EXTERNAL_DEVICE_ID}",
        "value": "gaussian_splat_v1|layer_0_active|points:1.2M"
    }

    print("[DEVICE] Publishing photorealistic spatial scan to DHT...")
    try:
        resp = requests.post(f"{GATEWAY_URL}/api/dht/put", json=spatial_record)
        if resp.status_code == 200:
            print("[SUCCESS] Spatial data propagated to mesh DHT.")
        else:
            print(f"[ERROR] Failed to publish spatial data: {resp.text}")
            return
    except Exception as e:
        print(f"[ERROR] Connection to gateway failed: {e}")
        return

    # 3. Search for Marketplace Goods via External Device
    print("[DEVICE] Searching marketplace for 'scanning' services...")
    time.sleep(2)
    try:
        search_resp = requests.get(f"{GATEWAY_URL}/api/market/search?q=scanning")
        results = search_resp.json()
        print(f"[DEVICE] Search Results: {json.dumps(results, indent=2)}")
    except Exception as e:
        print(f"[ERROR] Marketplace search failed: {e}")

    # 4. Peer-to-Peer Message Test
    print("[DEVICE] Sending broadcast 'AR_DEVICE_READY' message...")
    try:
        msg_resp = requests.post(f"{GATEWAY_URL}/api/messages/send", json={"content": "AR_DEVICE_READY_STAGING_001"})
        if msg_resp.status_code == 200:
            print("[SUCCESS] Mesh broadcast successful.")
        else:
            print(f"[ERROR] Message broadcast failed: {msg_resp.text}")
    except Exception as e:
        print(f"[ERROR] Broadcast failed: {e}")

    print("--- [STAGING] External Integration Test Complete ---")

if __name__ == "__main__":
    simulate_external_integration()
