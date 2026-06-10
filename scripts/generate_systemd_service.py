import os
import getpass

def generate_service():
    user = getpass.getuser()
    working_dir = os.getcwd()

    service_content = f"""[Unit]
Description=XRNet Autonomous Mesh Node
After=network.target

[Service]
Type=simple
User={user}
WorkingDirectory={working_dir}
ExecStart={working_dir}/start.sh release
Restart=always
RestartSec=10
StandardOutput=append:{working_dir}/logs/prod_runtime.log
StandardError=append:{working_dir}/logs/prod_runtime.log

[Install]
WantedBy=multi-user.target
"""

    with open("xrnet.service", "w") as f:
        f.write(service_content)

    print("[SUCCESS] systemd service file generated: xrnet.service")
    print("To install:")
    print("  sudo cp xrnet.service /etc/systemd/system/")
    print("  sudo systemctl daemon-reload")
    print("  sudo systemctl enable xrnet")
    print("  sudo systemctl start xrnet")

if __name__ == "__main__":
    generate_service()
