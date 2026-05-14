import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'instance', 'database.db')

def get_db():
    # Ensure directory exists
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

class User:
    @staticmethod
    def create(username, password_hash, display_name='', theme='light'):
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO users (username, password_hash, display_name, theme) VALUES (?, ?, ?, ?)",
                (username, password_hash, display_name, theme)
            )
            conn.commit()
            return cursor.lastrowid

    @staticmethod
    def get_by_id(user_id):
        with get_db() as conn:
            user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
            return dict(user) if user else None

    @staticmethod
    def get_by_username(username):
        with get_db() as conn:
            user = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
            return dict(user) if user else None

    @staticmethod
    def get_all():
        with get_db() as conn:
            users = conn.execute("SELECT * FROM users").fetchall()
            return [dict(u) for u in users]

    @staticmethod
    def update(user_id, display_name=None, theme=None):
        with get_db() as conn:
            user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
            if not user:
                return False
            
            new_display = display_name if display_name is not None else user['display_name']
            new_theme = theme if theme is not None else user['theme']
            
            conn.execute(
                "UPDATE users SET display_name = ?, theme = ? WHERE id = ?",
                (new_display, new_theme, user_id)
            )
            conn.commit()
            return True

    @staticmethod
    def delete(user_id):
        with get_db() as conn:
            conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
            conn.commit()
            return True
