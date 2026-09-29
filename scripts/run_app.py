"""
Runner script for the Negotiation Memory & Learning Agent application.
Starts FastAPI with Uvicorn.
"""
import sys
import uvicorn
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

def main():
    print("============================================================")
    print(" Institutional Negotiation Memory & Learning Agent")
    print(" Backend & Cockpit UI Server")
    print("============================================================")
    print("Starting server on http://127.0.0.1:8000 ...")
    print("Open http://127.0.0.1:8000 in your browser to access the cockpit.\n")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

if __name__ == "__main__":
    main()
