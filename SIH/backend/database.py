import sqlite3
from pathlib import Path

try:
    from .config import DATABASE_PATH
except ImportError:
    from config import DATABASE_PATH


SCHEMA = """
CREATE TABLE IF NOT EXISTS beneficiaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    district TEXT,
    education TEXT,
    occupation TEXT,
    experience_years INTEGER,
    career_goal TEXT,
    language TEXT DEFAULT 'en'
);

CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    beneficiary_id INTEGER NOT NULL,
    skill TEXT NOT NULL,
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS interests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    beneficiary_id INTEGER NOT NULL,
    interest TEXT NOT NULL,
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    beneficiary_id INTEGER NOT NULL,
    course_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS skill_gaps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    beneficiary_id INTEGER NOT NULL,
    skill TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_beneficiaries_district ON beneficiaries(district);
CREATE INDEX IF NOT EXISTS idx_skills_beneficiary ON skills(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_interests_beneficiary ON interests(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_beneficiary ON recommendations(beneficiary_id);
"""


def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = get_db_connection()
    conn.executescript(SCHEMA)
    conn.commit()
    conn.close()


def fetch_all(query, params=()):
    conn = get_db_connection()
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return rows


def fetch_one(query, params=()):
    conn = get_db_connection()
    row = conn.execute(query, params).fetchone()
    conn.close()
    return row


def execute(query, params=()):
    conn = get_db_connection()
    cur = conn.execute(query, params)
    conn.commit()
    last_id = cur.lastrowid
    conn.close()
    return last_id


def delete_all_rows():
    conn = get_db_connection()
    tables = ["recommendations", "skill_gaps", "skills", "interests", "beneficiaries"]
    for table in tables:
        conn.execute(f"DELETE FROM {table}")
    conn.commit()
    conn.close()
