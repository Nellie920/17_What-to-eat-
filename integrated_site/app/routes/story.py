from flask import Blueprint, request, render_template, redirect, url_for, session, flash
from app.models.user import User
from app.models.achievement import Achievement

story_bp = Blueprint('story', __name__)

@story_bp.route('/', methods=['GET'])
def home():
    """
    GET: 顯示登入後的主選單 (首頁)，包含「開始遊戲」、「讀取存檔」、「個人設定」等入口。
         需檢查 session 是否登入。
    """
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    
    user = User.get_by_id(session['user_id'])
    return render_template('story/home.html', user=user)

@story_bp.route('/story/<node_id>', methods=['GET'])
def play_story(node_id):
    """
    GET: 根據 node_id 撈取並顯示對應的劇情文本、過場圖與選項分支。
         在此頁面渲染玩家自訂的 display_name，並處理隱藏成就解鎖邏輯。
    """
    if 'user_id' not in session:
        flash('請先登入以進行遊戲。', 'warning')
        return redirect(url_for('auth.login'))
    
    user = User.get_by_id(session['user_id'])
    
    # 此處應實作讀取靜態故事文本 (JSON) 或資料庫邏輯。
    # 為了示範，先傳遞虛擬的 story_data 給模板。
    story_data = {
        'node_id': node_id,
        'text': f"這是劇情節點 {node_id} 的內容...",
    }
    
    # 示範隱藏成就解鎖邏輯
    if node_id == 'secret_ending':
        Achievement.create(user['id'], 'SECRET_01')
        flash('恭喜！解鎖隱藏成就！', 'success')

    return render_template('story/play.html', user=user, story=story_data)
