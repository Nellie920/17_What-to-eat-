from .user import get_db_connection
import json

class Save:
    @staticmethod
    def _parse_save(save_dict):
        if not save_dict:
            return None
        d = dict(save_dict)
        try:
            d['saved_state'] = json.loads(d.get('saved_state') or '{}')
        except:
            d['saved_state'] = {}
        return d

    @staticmethod
    def create(user_id, node_id, chapter=1, saved_state=None):
        try:
            state_str = json.dumps(saved_state) if saved_state else '{}'
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO saves (user_id, node_id, chapter, saved_state) VALUES (?, ?, ?, ?)",
                    (user_id, node_id, chapter, state_str)
                )
                conn.commit()
                return cursor.lastrowid
        except Exception as e:
            print(f"Save.create Error: {e}")
            return None

    @staticmethod
    def get_by_id(save_id):
        try:
            with get_db_connection() as conn:
                save = conn.execute("SELECT * FROM saves WHERE id = ?", (save_id,)).fetchone()
                return Save._parse_save(save)
        except Exception as e:
            print(f"Save.get_by_id Error: {e}")
            return None

    @staticmethod
    def get_all():
        try:
            with get_db_connection() as conn:
                saves = conn.execute("SELECT * FROM saves").fetchall()
                return [Save._parse_save(s) for s in saves]
        except Exception as e:
            print(f"Save.get_all Error: {e}")
            return []

    @staticmethod
    def get_all_by_user(user_id):
        try:
            with get_db_connection() as conn:
                saves = conn.execute("SELECT * FROM saves WHERE user_id = ? ORDER BY saved_at DESC", (user_id,)).fetchall()
                return [Save._parse_save(s) for s in saves]
        except Exception as e:
            print(f"Save.get_all_by_user Error: {e}")
            return []

    @staticmethod
    def update(save_id, node_id, chapter=1, saved_state=None):
        try:
            state_str = json.dumps(saved_state) if saved_state else '{}'
            with get_db_connection() as conn:
                cursor = conn.execute(
                    "UPDATE saves SET node_id = ?, chapter = ?, saved_state = ?, saved_at = CURRENT_TIMESTAMP WHERE id = ?",
                    (node_id, chapter, state_str, save_id)
                )
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"Save.update Error: {e}")
            return False

    @staticmethod
    def delete(save_id):
        try:
            with get_db_connection() as conn:
                cursor = conn.execute("DELETE FROM saves WHERE id = ?", (save_id,))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"Save.delete Error: {e}")
            return False
