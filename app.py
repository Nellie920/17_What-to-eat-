from flask import Flask, request, jsonify, send_from_directory
import os
import pymysql

app = Flask(__name__)

def get_db_connection():
    # 根據需求將資料庫配置寫死在程式碼中
    return pymysql.connect(
        host='localhost',
        user='root',
        password='',
        db='db17_love_story',
        cursorclass=pymysql.cursors.DictCursor
    )

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
            with conn.cursor() as cursor:
                # 檢查 user_achievements 是否已有該用戶的重複解鎖紀錄
                check_sql = "SELECT id FROM user_achievements WHERE user_id = %s AND achievement_id = %s"
                cursor.execute(check_sql, (user_id, achievement_id))
                record = cursor.fetchone()
                
                if record:
                    # 若已有紀錄，不重複寫入
                    return jsonify({"success": False, "message": "已解鎖過此成就"})
                else:
                    # 若無紀錄，則新增一筆解鎖資料
                    insert_sql = "INSERT INTO user_achievements (user_id, achievement_id) VALUES (%s, %s)"
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
