import sqlite3
import os

def get_db_connection():
    """
    建立並回傳與 instance/database.db 的 SQLite 資料庫連線。
    設定 row_factory 讓回傳結果可用欄位名稱取值。
    """
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'instance', 'database.db')
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

class User:
    @staticmethod
    def create(username, password_hash, display_name='', theme='light'):
        """
        新增一筆使用者資料。
        參數:
            username (str): 登入帳號
            password_hash (str): 雜湊後的密碼
            display_name (str): 玩家自訂名稱
            theme (str): 介面佈景主題
        回傳:
            int: 新增成功回傳最後的 row id，失敗回傳 None
        """
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO users (username, password_hash, display_name, theme) VALUES (?, ?, ?, ?)",
                    (username, password_hash, display_name, theme)
                )
                conn.commit()
                return cursor.lastrowid
        except Exception as e:
            print(f"User.create Error: {e}")
            return None

    @staticmethod
    def get_by_id(user_id):
        """
        透過 ID 取得單筆使用者記錄。
        參數:
            user_id (int): 使用者 ID
        回傳:
            dict: 成功回傳字典格式資料，失敗或找不到回傳 None
        """
        try:
            with get_db_connection() as conn:
                user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
                return dict(user) if user else None
        except Exception as e:
            print(f"User.get_by_id Error: {e}")
            return None

    @staticmethod
    def get_by_username(username):
        """
        透過帳號取得單筆使用者記錄 (登入用)。
        參數:
            username (str): 使用者帳號
        回傳:
            dict: 成功回傳字典格式資料，失敗或找不到回傳 None
        """
        try:
            with get_db_connection() as conn:
                user = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
                return dict(user) if user else None
        except Exception as e:
            print(f"User.get_by_username Error: {e}")
            return None

    @staticmethod
    def get_all():
        """
        取得所有使用者記錄。
        回傳:
            list: 包含所有使用者資料(字典)的列表
        """
        try:
            with get_db_connection() as conn:
                users = conn.execute("SELECT * FROM users").fetchall()
                return [dict(u) for u in users]
        except Exception as e:
            print(f"User.get_all Error: {e}")
            return []

    @staticmethod
    def update(user_id, display_name=None, theme=None):
        """
        更新使用者資料。
        參數:
            user_id (int): 使用者 ID
            display_name (str, optional): 新的角色名稱
            theme (str, optional): 新的佈景主題
        回傳:
            bool: 更新成功回傳 True，否則 False
        """
        try:
            user = User.get_by_id(user_id)
            if not user:
                return False
            
            new_display = display_name if display_name is not None else user['display_name']
            new_theme = theme if theme is not None else user['theme']
            
            with get_db_connection() as conn:
                conn.execute(
                    "UPDATE users SET display_name = ?, theme = ? WHERE id = ?",
                    (new_display, new_theme, user_id)
                )
                conn.commit()
                return True
        except Exception as e:
            print(f"User.update Error: {e}")
            return False

    @staticmethod
    def delete(user_id):
        """
        刪除一筆使用者記錄。
        參數:
            user_id (int): 使用者 ID
        回傳:
            bool: 刪除成功回傳 True，否則 False
        """
        try:
            with get_db_connection() as conn:
                cursor = conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"User.delete Error: {e}")
            return False
