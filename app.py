import sys
from pathlib import Path

# Add project root and SIH directories to python path
root_dir = Path(__file__).resolve().parent
sih_dir = root_dir / "SIH"
sys.path.insert(0, str(sih_dir))

from backend.app import app

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
