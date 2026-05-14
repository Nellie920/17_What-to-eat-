from .user import get_db

class Achievement:
    @staticmethod
    def create(user_id, achievement_id):
        with get_db() as conn:
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

    @staticmethod
    def get_by_id(record_id):
        with get_db() as conn:
            record = conn.execute("SELECT * FROM user_achievements WHERE id = ?", (record_id,)).fetchone()
            return dict(record) if record else None

    @staticmethod
    def get_all_by_user(user_id):
        with get_db() as conn:
            achievements = conn.execute("SELECT * FROM user_achievements WHERE user_id = ? ORDER BY unlocked_at DESC", (user_id,)).fetchall()
            return [dict(a) for a in achievements]

    @staticmethod
    def delete(record_id):
        with get_db() as conn:
            cursor = conn.execute("DELETE FROM user_achievements WHERE id = ?", (record_id,))
            conn.commit()
            return cursor.rowcount > 0
