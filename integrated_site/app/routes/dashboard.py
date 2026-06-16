import os
from flask import Blueprint, render_template, session, redirect, url_for, jsonify
from app.models.user import User, get_db_connection

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard', methods=['GET'])
def index():
    """
    實體整合版儀表板路由。
    從 SQLite 資料庫中動態撈取當前的使用者數量、存檔數量與成就解鎖狀況，並進行展示。
    若使用者未登入，亦允許其查看系統運行與專案狀態，增加實用性（若要測試實體數據，則需先登入）。
    """
    stats = {
        'user_count': 0,
        'save_count': 0,
        'achievement_count': 0,
        'unlocked_count': 0,
        'db_size_kb': 0,
        'db_exists': False,
        'latest_users': [],
        'achievements_distribution': []
    }

    try:
        # 1. 檢測資料庫實體屬性
        base_dir = os.path.abspath(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        db_path = os.path.join(base_dir, 'instance', 'database.db')
        if os.path.exists(db_path):
            stats['db_exists'] = True
            stats['db_size_kb'] = round(os.path.getsize(db_path) / 1024, 2)

        # 2. 獲取資料表數據統計
        with get_db_connection() as conn:
            # 統計總數
            stats['user_count'] = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
            stats['save_count'] = conn.execute("SELECT COUNT(*) FROM saves").fetchone()[0]
            stats['achievement_count'] = conn.execute("SELECT COUNT(*) FROM achievements").fetchone()[0]
            stats['unlocked_count'] = conn.execute("SELECT COUNT(*) FROM user_achievements").fetchone()[0]
            
            # 最近註冊的 5 位玩家
            latest_users = conn.execute("SELECT id, username, display_name, theme, created_at FROM users ORDER BY id DESC LIMIT 5").fetchall()
            stats['latest_users'] = [dict(u) for u in latest_users]

            # 成就解鎖分佈狀況
            dist = conn.execute("""
                SELECT a.id, a.title, a.description, a.points, COUNT(ua.id) as unlock_count 
                FROM achievements a 
                LEFT JOIN user_achievements ua ON a.id = ua.achievement_id 
                GROUP BY a.id
            """).fetchall()
            stats['achievements_distribution'] = [dict(d) for d in dist]

    except Exception as e:
        print(f"Dashboard stats fetching failed: {e}")

    return jsonify(stats)

@dashboard_bp.route('/api/health', methods=['GET'])
def health_check():
    """
    提供給儀表板健康診斷工具呼叫的 API。
    """
    health = {
        'status': 'healthy',
        'database': 'connected',
        'tables': [],
        'error': None
    }
    try:
        with get_db_connection() as conn:
            # 測試查詢並檢查資料表是否存在
            tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
            health['tables'] = [t['name'] for t in tables]
    except Exception as e:
        health['status'] = 'unhealthy'
        health['database'] = 'error'
        health['error'] = str(e)
    
    return jsonify(health)
