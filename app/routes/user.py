from flask import Blueprint, request, render_template, redirect, url_for, session, flash, jsonify
from app.models.user import User, get_db_connection
from app.models.achievement import Achievement

user_bp = Blueprint('user', __name__)

@user_bp.route('/settings', methods=['GET'])
def settings():
    """
    GET: 顯示個人化設定頁面，包含更改角色名稱 (display_name) 與佈景主題 (theme) 的表單。
    """
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
        
    user = User.get_by_id(session['user_id'])
    return render_template('user/settings.html', user=user)

@user_bp.route('/settings/update', methods=['POST'])
def update_settings():
    """
    POST: 接收設定表單資料，更新資料庫中使用者的設定，
          並附帶 flash 成功訊息後重導向回設定頁面。
    """
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
        
    display_name = request.form.get('display_name')
    theme = request.form.get('theme')
    
    if User.update(session['user_id'], display_name=display_name, theme=theme):
        flash('個人設定更新成功！', 'success')
    else:
        flash('更新失敗，請稍後再試。', 'danger')
        
    return redirect(url_for('user.settings'))

@user_bp.route('/achievements', methods=['GET'])
def achievements():
    """
    GET: 撈取玩家在資料庫中的解鎖紀錄，並顯示已解鎖與未解鎖的成就清單。
    """
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
        
    user = User.get_by_id(session['user_id'])
    user_achievements = Achievement.get_all_by_user(session['user_id'])
    
    return render_template('user/achievements.html', user=user, achievements=user_achievements)


# ========================================================
# JSON API 路由 (供沉浸式 SPA 模式使用)
# ========================================================

@user_bp.route('/api/achievements', methods=['GET'])
def api_get_achievements():
    if 'user_id' not in session:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
        
    user_id = session['user_id']
    try:
        with get_db_connection() as conn:
            # 獲取所有成就定義
            all_ac = conn.execute("SELECT * FROM achievements").fetchall()
            # 獲取當前玩家解鎖的成就
            unlocked = conn.execute("SELECT * FROM user_achievements WHERE user_id = ?", (user_id,)).fetchall()
            unlocked_ids = {ua['achievement_id'] for ua in unlocked}
            unlocked_times = {ua['achievement_id']: ua['unlocked_at'] for ua in unlocked}
            
            result = []
            for ac in all_ac:
                ac_id = ac['id']
                is_unlocked = ac_id in unlocked_ids
                result.append({
                    'id': ac_id,
                    'title': ac['title'],
                    'description': ac['description'],
                    'icon_url': ac['badge_url'],
                    'points': ac['points'],
                    'unlocked': is_unlocked,
                    'unlocked_at': unlocked_times.get(ac_id) if is_unlocked else None
                })
            return jsonify({
                'status': 'success',
                'achievements': result
            }), 200
    except Exception as e:
        print(f"api_get_achievements Error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@user_bp.route('/api/achievements/unlock', methods=['POST'])
def api_unlock_achievement():
    if 'user_id' not in session:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
        
    user_id = session['user_id']
    data = request.get_json() or {}
    achievement_id = data.get('achievement_id')
    
    if not achievement_id:
        return jsonify({'status': 'error', 'message': '請提供欲解鎖的成就識別碼。'}), 400
        
    try:
        with get_db_connection() as conn:
            # 查詢成就定義是否存在
            ac = conn.execute("SELECT * FROM achievements WHERE id = ?", (achievement_id,)).fetchone()
            if not ac:
                return jsonify({'status': 'error', 'message': '找不到指定的成就定義。'}), 404
                
            # 檢查是否已解鎖過
            existing = conn.execute("SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?", (user_id, achievement_id)).fetchone()
            if existing:
                return jsonify({
                    'status': 'success',
                    'message': '此成就之前已解鎖過。',
                    'already_unlocked': True,
                    'achievement': {
                        'id': ac['id'],
                        'title': ac['title'],
                        'description': ac['description'],
                        'icon_url': ac['badge_url'],
                        'points': ac['points']
                    }
                }), 200
                
            # 解鎖成就
            cursor = conn.cursor()
            cursor.execute("INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)", (user_id, achievement_id))
            conn.commit()
            
            return jsonify({
                'status': 'success',
                'message': f"恭喜解鎖成就：【{ac['title']}】！",
                'already_unlocked': False,
                'achievement': {
                    'id': ac['id'],
                    'title': ac['title'],
                    'description': ac['description'],
                    'icon_url': ac['badge_url'],
                    'points': ac['points']
                }
            }), 200
    except Exception as e:
        print(f"api_unlock_achievement Error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

