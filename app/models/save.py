from .user import get_db

class Save:
    @staticmethod
    def create(user_id, node_id):
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO saves (user_id, node_id) VALUES (?, ?)",
                (user_id, node_id)
            )
            conn.commit()
            return cursor.lastrowid

    @staticmethod
    def get_by_id(save_id):
        with get_db() as conn:
            save = conn.execute("SELECT * FROM saves WHERE id = ?", (save_id,)).fetchone()
            return dict(save) if save else None

    @staticmethod
    def get_all_by_user(user_id):
        with get_db() as conn:
            saves = conn.execute("SELECT * FROM saves WHERE user_id = ? ORDER BY saved_at DESC", (user_id,)).fetchall()
            return [dict(s) for s in saves]

    @staticmethod
    def update(save_id, node_id):
        with get_db() as conn:
            cursor = conn.execute(
                "UPDATE saves SET node_id = ?, saved_at = CURRENT_TIMESTAMP WHERE id = ?",
                (node_id, save_id)
            )
            conn.commit()
            return cursor.rowcount > 0

    @staticmethod
    def delete(save_id):
        with get_db() as conn:
            cursor = conn.execute("DELETE FROM saves WHERE id = ?", (save_id,))
            conn.commit()
            return cursor.rowcount > 0
