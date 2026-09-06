import os
from pathlib import Path
from dotenv import load_dotenv

root_dir = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=root_dir / ".env")
load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
DATABASE_DIR = BASE_DIR / "database"
DATABASE_PATH = Path(os.getenv("DATABASE_PATH", "/tmp/livelihood_saathi.db" if os.getenv("VERCEL") else str(DATABASE_DIR / "livelihood_saathi.db")))

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
AI_API_KEY = os.getenv("AI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
