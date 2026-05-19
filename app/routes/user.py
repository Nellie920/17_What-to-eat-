from flask import Blueprint, request, render_template, redirect, url_for, session, flash
from app.models.user import User
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
