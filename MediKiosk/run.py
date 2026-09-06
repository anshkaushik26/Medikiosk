"""MediKiosk All-in-One Launcher Script.
Run in VS Code terminal: python run.py
"""
import os
import sys
import time
import subprocess
import webbrowser

def kill_process_tree(pid):
    """Cleanly terminate a process and all its child processes on Windows."""
    try:
        subprocess.run(f"taskkill /F /T /PID {pid}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    venv_python = os.path.join(root_dir, "backend", ".venv", "Scripts", "python.exe")
    frontend_dir = os.path.join(root_dir, "frontend")

    # Fallback to system python if venv python path is missing
    if not os.path.exists(venv_python):
        venv_python = sys.executable

    print("=" * 60)
    print("           STARTING MEDIKIOSK DIGITAL HEALTHCARE")
    print("=" * 60)

    # 1. Start Backend Server (FastAPI on Port 8000)
    print("\n[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...")
    backend_cmd = [
        venv_python,
        "-m", "uvicorn",
        "backend.app.main:app",
        "--host", "127.0.0.1",
        "--port", "8000",
        "--reload"
    ]
    p_backend = subprocess.Popen(backend_cmd, cwd=root_dir)

    time.sleep(2.5)

    # 2. Start Frontend Server (Next.js on Port 3000)
    print("[2/2] Starting Next.js Frontend on http://localhost:3000 ...")
    p_frontend = subprocess.Popen("npm run dev", cwd=frontend_dir, shell=True)

    time.sleep(3)

    print("\n" + "=" * 60)
    print("  MEDIKIOSK is running!")
    print("  Backend API:  http://127.0.0.1:8000")
    print("  Frontend UI:  http://localhost:3000")
    print("=" * 60)
    print("\nOpening http://localhost:3000 in your browser...")
    webbrowser.open("http://localhost:3000")

    print("\n[Tip] Press Ctrl+C in this terminal window anytime to stop both servers.\n")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping MediKiosk servers...")
        kill_process_tree(p_backend.pid)
        kill_process_tree(p_frontend.pid)
        print("Both servers stopped cleanly.")

if __name__ == "__main__":
    main()
