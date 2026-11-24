import sys
import os
from pathlib import Path

# Permitir ejecución tanto como script directo como paquete (python -m app.seed)
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

from scripts.seed import seed_all

if __name__ == "__main__":
    seed_all()
