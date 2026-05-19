from flask import Flask, request, jsonify, send_from_directory
import os
import sqlite3

app = Flask(__name__)
DB_FILE = 'db17_love_story.db'

def get_db_connection():
    # 使用 SQLite 連接檔案型資料庫
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row  # 允許使用欄位名稱存取資料
    return conn

def init_db():
    # 若資料庫不存在，則自動從 schema.sql 讀取並建立資料表與測試資料
    if not os.path.exists(DB_FILE):
        print("資料庫檔案不存在，正在自動建立與初始化...")
        conn = get_db_connection()
        try:
            with open('schema.sql', 'r', encoding='utf-8') as f:
                schema_sql = f.read()
            conn.executescript(schema_sql)
            conn.commit()
            print("資料庫初始化成功！")
        except Exception as e:
            print(f"資料庫初始化失敗: {e}")
        finally:
            conn.close()

# 啟動應用程式時自動初始化資料庫
init_db()

@app.route('/api/achievement/unlock', methods=['POST'])
def unlock_achievement():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "無效的請求資料格式"}), 400
            
        user_id = data.get('user_id')
        achievement_id = data.get('achievement_id')
        
        if not user_id or not achievement_id:
            return jsonify({"success": False, "message": "缺少必需的參數 user_id 或 achievement_id"}), 400

        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            # 檢查 user_achievements 是否已有該用戶的重複解鎖紀錄 (SQLite 參數化查詢使用 ?)
            check_sql = "SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?"
            cursor.execute(check_sql, (user_id, achievement_id))
            record = cursor.fetchone()
            
            if record:
                # 若已有紀錄，不重複寫入
                return jsonify({"success": False, "message": "已解鎖過此成就"})
            else:
                # 若無紀錄，則新增一筆解鎖資料
                insert_sql = "INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)"
                cursor.execute(insert_sql, (user_id, achievement_id))
                conn.commit()
                return jsonify({"success": True, "message": "解鎖成功"})
        finally:
            conn.close()
            
    except Exception as e:
        return jsonify({"success": False, "message": f"伺服器錯誤: {str(e)}"}), 500

@app.route('/')
def index():
    return send_from_directory(os.path.dirname(os.path.abspath(__file__)), 'index.html')

if __name__ == '__main__':
    app.run(debug=True)
