"""
Helper script to start and monitor the local Hindsight server on port 8888.
"""
import sys
import os
import subprocess
import time
import requests
from pathlib import Path

def check_server(url="http://127.0.0.1:8888", timeout=2.0) -> bool:
    try:
        r = requests.get(f"{url}/health", timeout=timeout)
        if r.status_code in [200, 204]:
            return True
    except Exception:
        pass
    try:
        r = requests.get(url, timeout=timeout)
        if r.status_code in [200, 404]:
            return True
    except Exception:
        pass
    return False

def main():
    print("============================================================")
    print(" Hindsight Local Server Manager (Port 8888)")
    print("============================================================")

    target_url = "http://127.0.0.1:8888"
    if check_server(target_url):
        print(f"[OK] Hindsight server is ALREADY running and healthy at {target_url}!")
        return

    print(f"Hindsight server is not currently running at {target_url}.")
    print("Attempting to start Hindsight API server...")

    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    env["HINDSIGHT_API_PORT"] = "8888"
    env["HINDSIGHT_API_HOST"] = "127.0.0.1"
    if "HINDSIGHT_API_LLM_PROVIDER" not in env:
        env["HINDSIGHT_API_LLM_PROVIDER"] = "none"

    # Command candidates
    commands = [
        ["hindsight-api"],
        [sys.executable, "-m", "hindsight_api"],
        [sys.executable, "-m", "hindsight"]
    ]

    process = None
    for cmd in commands:
        try:
            print(f"Trying command: {' '.join(cmd)} ...")
            process = subprocess.Popen(
                cmd,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            time.sleep(3)
            if process.poll() is None:
                print(f"[STARTED] Process spawned (PID: {process.pid}).")
                break
            else:
                stdout, stderr = process.communicate()
                print(f"Process exited with code {process.returncode}. Stderr: {stderr[:200]}")
        except FileNotFoundError:
            continue
        except Exception as e:
            print(f"Error launching {cmd}: {e}")

    # Wait up to 15 seconds for health endpoint
    print("Waiting for Hindsight health check...")
    for i in range(15):
        if check_server(target_url):
            print(f"[SUCCESS] Hindsight server is LIVE at {target_url}!")
            return
        time.sleep(1)

    print("\n[NOTE] If Hindsight requires an external provider or docker container, you can run:")
    print("   docker run -p 8888:8888 ghcr.io/vectorize-io/hindsight:latest")
    print("The negotiation-memory app will automatically connect as soon as port 8888 is active.")

if __name__ == "__main__":
    main()
