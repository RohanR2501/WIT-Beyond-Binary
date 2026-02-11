import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "buddybridge.db"

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        age_range TEXT,
        interests TEXT NOT NULL,
        vibe TEXT NOT NULL,
        prefers_group INTEGER NOT NULL,
        ai_enabled INTEGER NOT NULL DEFAULT 1
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        text TEXT NOT NULL,
        ts INTEGER NOT NULL
    );
    """)

    conn.commit()
    conn.close()
