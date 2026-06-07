import socket
import sys
import time

def start_mock_peer(port=9000):
    sys.stdout.write(f"[MOCK-PEER] Starting on port {port}...\n")
    sys.stdout.flush()
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            s.bind(('127.0.0.1', port))
            s.listen()
            sys.stdout.write(f"[MOCK-PEER] Listening for xrnet handshake...\n")
            sys.stdout.flush()

            while True:
                conn, addr = s.accept()
                with conn:
                    sys.stdout.write(f"[MOCK-PEER] Connection from {addr}\n")
                    sys.stdout.flush()
                    data = conn.recv(1024)
                    if not data:
                        break
                    sys.stdout.write(f"[MOCK-PEER] Received: {data.decode()}\n")
                    sys.stdout.flush()
                    if data.decode() == "XRNET_HANDSHAKE":
                        conn.sendall(b"XRNET_ACK")
                        sys.stdout.write("[MOCK-PEER] Handshake complete.\n")
                        sys.stdout.flush()
    except Exception as e:
        sys.stdout.write(f"[MOCK-PEER] Error: {e}\n")
        sys.stdout.flush()
        sys.exit(1)

if __name__ == "__main__":
    start_mock_peer()
