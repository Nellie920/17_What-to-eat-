from .user import get_db_connection

class Save:
    @staticmethod
    def create(user_id, node_id):
        """
        新增一筆存檔紀錄。
        參數:
            user_id (int): 使用者 ID
            node_id (str): 故事節點 ID
        回傳:
            int: 新增成功回傳最後的 row id，失敗回傳 None
        """
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO saves (user_id, node_id) VALUES (?, ?)",
                    (user_id, node_id)
                )
                conn.commit()
                return cursor.lastrowid
        except Exception as e:
            print(f"Save.create Error: {e}")
            return None

    @staticmethod
    def get_by_id(save_id):
        """
        透過 ID 取得單筆存檔記錄。
        參數:
            save_id (int): 存檔 ID
        回傳:
            dict: 成功回傳字典格式資料，失敗或找不到回傳 None
        """
        try:
            with get_db_connection() as conn:
                save = conn.execute("SELECT * FROM saves WHERE id = ?", (save_id,)).fetchone()
                return dict(save) if save else None
        except Exception as e:
            print(f"Save.get_by_id Error: {e}")
            return None

    @staticmethod
    def get_all():
        """
        取得系統內所有存檔記錄。
        回傳:
            list: 包含存檔資料的列表
        """
        try:
            with get_db_connection() as conn:
                saves = conn.execute("SELECT * FROM saves").fetchall()
                return [dict(s) for s in saves]
        except Exception as e:
            print(f"Save.get_all Error: {e}")
            return []

    @staticmethod
    def get_all_by_user(user_id):
        """
        取得特定玩家的所有存檔記錄。
        參數:
            user_id (int): 使用者 ID
        回傳:
            list: 包含存檔資料的列表，依照時間倒序排列
        """
        try:
            with get_db_connection() as conn:
                saves = conn.execute("SELECT * FROM saves WHERE user_id = ? ORDER BY saved_at DESC", (user_id,)).fetchall()
                return [dict(s) for s in saves]
        except Exception as e:
            print(f"Save.get_all_by_user Error: {e}")
            return []

    @staticmethod
    def update(save_id, node_id):
        """
        更新存檔記錄的節點位置與存檔時間。
        參數:
            save_id (int): 存檔 ID
            node_id (str): 新的故事節點 ID
        回傳:
            bool: 更新成功回傳 True，否則 False
        """
        try:
            with get_db_connection() as conn:
                cursor = conn.execute(
                    "UPDATE saves SET node_id = ?, saved_at = CURRENT_TIMESTAMP WHERE id = ?",
                    (node_id, save_id)
                )
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"Save.update Error: {e}")
            return False

    @staticmethod
    def delete(save_id):
        """
        刪除一筆存檔記錄。
        參數:
            save_id (int): 存檔 ID
        回傳:
            bool: 刪除成功回傳 True，否則 False
        """
        try:
            with get_db_connection() as conn:
                cursor = conn.execute("DELETE FROM saves WHERE id = ?", (save_id,))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"Save.delete Error: {e}")
            return False
