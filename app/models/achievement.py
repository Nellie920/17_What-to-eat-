from .user import get_db_connection

class Achievement:
    @staticmethod
    def create(user_id, achievement_id):
        """
        新增一筆成就解鎖紀錄。若已解鎖過則忽略。
        參數:
            user_id (int): 使用者 ID
            achievement_id (str): 成就代碼
        回傳:
            int: 成功回傳 row id，失敗回傳 None
        """
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                # 檢查是否已解鎖過
                existing = conn.execute("SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?", (user_id, achievement_id)).fetchone()
                if existing:
                    return existing['id']
                    
                cursor.execute(
                    "INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)",
                    (user_id, achievement_id)
                )
                conn.commit()
                return cursor.lastrowid
        except Exception as e:
            print(f"Achievement.create Error: {e}")
            return None

    @staticmethod
    def get_by_id(record_id):
        """
        透過 ID 取得單筆成就記錄。
        參數:
            record_id (int): 紀錄 ID
        回傳:
            dict: 成功回傳字典，否則 None
        """
        try:
            with get_db_connection() as conn:
                record = conn.execute("SELECT * FROM user_achievements WHERE id = ?", (record_id,)).fetchone()
                return dict(record) if record else None
        except Exception as e:
            print(f"Achievement.get_by_id Error: {e}")
            return None

    @staticmethod
    def get_all():
        """
        取得系統內所有成就解鎖記錄。
        回傳:
            list: 包含紀錄資料的列表
        """
        try:
            with get_db_connection() as conn:
                achievements = conn.execute("SELECT * FROM user_achievements").fetchall()
                return [dict(a) for a in achievements]
        except Exception as e:
            print(f"Achievement.get_all Error: {e}")
            return []

    @staticmethod
    def get_all_by_user(user_id):
        """
        取得特定玩家的所有解鎖紀錄。
        參數:
            user_id (int): 使用者 ID
        回傳:
            list: 依照解鎖時間倒序排列的列表
        """
        try:
            with get_db_connection() as conn:
                achievements = conn.execute("SELECT * FROM user_achievements WHERE user_id = ? ORDER BY unlocked_at DESC", (user_id,)).fetchall()
                return [dict(a) for a in achievements]
        except Exception as e:
            print(f"Achievement.get_all_by_user Error: {e}")
            return []
            
    @staticmethod
    def update(record_id, achievement_id):
        """
        更新成就記錄。
        參數:
            record_id (int): 紀錄 ID
            achievement_id (str): 新的成就代碼
        回傳:
            bool: 更新成功回傳 True，否則 False
        """
        try:
            with get_db_connection() as conn:
                cursor = conn.execute(
                    "UPDATE user_achievements SET achievement_id = ?, unlocked_at = CURRENT_TIMESTAMP WHERE id = ?",
                    (achievement_id, record_id)
                )
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"Achievement.update Error: {e}")
            return False

    @staticmethod
    def delete(record_id):
        """
        刪除一筆成就解鎖記錄。
        參數:
            record_id (int): 紀錄 ID
        回傳:
            bool: 刪除成功回傳 True，否則 False
        """
        try:
            with get_db_connection() as conn:
                cursor = conn.execute("DELETE FROM user_achievements WHERE id = ?", (record_id,))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"Achievement.delete Error: {e}")
            return False
