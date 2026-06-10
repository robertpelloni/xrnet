import psutil
import platform
import os
import sys

def log(msg):
    print(f"[HW-VAL] {msg}")

def validate_hardware():
    print("========================================")
    print("      XRNet Hardware Compatibility      ")
    print("========================================\n")

    # 1. CPU Check
    cpu_count = psutil.cpu_count(logical=False)
    cpu_arch = platform.machine()
    log(f"CPU: {cpu_arch} with {cpu_count} physical cores")

    if cpu_count < 2:
        log("[WARN] Minimal dual-core requirement not met. Mesh performance may degrade.")
    else:
        log("[OK] CPU core count sufficient.")

    # 2. Memory Check
    mem = psutil.virtual_memory()
    mem_total_gb = mem.total / (1024**3)
    log(f"Total RAM: {mem_total_gb:.2f} GB")

    if mem_total_gb < 3.5:
        log("[WARN] Less than 4GB RAM detected. Spatial AI modules may fail to load.")
    else:
        log("[OK] RAM capacity sufficient.")

    # 3. Disk Space Check
    usage = psutil.disk_usage('/')
    free_gb = usage.free / (1024**3)
    log(f"Free Disk Space: {free_gb:.2f} GB")

    if free_gb < 1.0:
        log("[WARN] Insufficient disk space for core OS and spatial maps.")
    else:
        log("[OK] Disk space sufficient.")

    # 4. OS Check
    system = platform.system()
    dist = platform.version()
    log(f"Operating System: {system} {dist}")

    if system != "Linux":
        log("[WARN] Target hardware environment is typically Linux. Cross-platform support is in debug mode.")
    else:
        log("[OK] Operating System compatible.")

    print("\n--- Summary ---")
    if cpu_count >= 2 and mem_total_gb >= 3.5 and free_gb >= 1.0:
        print("[SUCCESS] Hardware validated for XRNet Deployment.")
        return True
    else:
        print("[WARNING] Hardware validation passed with warnings. Performance optimization recommended.")
        return True # Still allow deployment but with awareness

if __name__ == "__main__":
    validate_hardware()
