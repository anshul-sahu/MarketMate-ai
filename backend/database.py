
import json
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "campaigns.db"


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS campaigns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                business_name TEXT NOT NULL,
                business_type TEXT NOT NULL,
                target_audience TEXT NOT NULL,
                budget REAL NOT NULL,
                duration_days INTEGER NOT NULL,
                campaign_goal TEXT NOT NULL,
                result TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)


def save_campaign(campaign):
    with get_connection() as connection:
        cursor = connection.execute("""
            INSERT INTO campaigns (
                business_name,
                business_type,
                target_audience,
                budget,
                duration_days,
                campaign_goal,
                result
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            campaign["business_name"],
            campaign["business_type"],
            campaign["target_audience"],
            campaign["budget"],
            campaign["duration_days"],
            campaign["campaign_goal"],
            campaign["result"]
        ))

        return cursor.lastrowid


def get_campaigns():
    with get_connection() as connection:
        rows = connection.execute("""
            SELECT *
            FROM campaigns
            ORDER BY id DESC
        """).fetchall()

        return [dict(row) for row in rows]
