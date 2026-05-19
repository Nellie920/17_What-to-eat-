import os
import json
from flask import Blueprint, request, render_template, redirect, url_for, session, flash, current_app
from app.models.user import User
from app.models.achievement import Achievement

story_bp = Blueprint('story', __name__)

def load_story_data():
    """載入靜態故事文本"""
    data_path = os.path.join(current_app.root_path, 'data', 'story.json')
    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        return {}

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
    
    # 讀取靜態故事文本 (JSON)
    story_db = load_story_data()
    
    # 若找不到節點，預設回到 chapter1 或給予提示
    if node_id not in story_db:
        flash('找不到該劇情節點，已為您回到起點。', 'warning')
        return redirect(url_for('story.play_story', node_id='chapter1'))
        
    story_data = story_db[node_id]
    story_data['node_id'] = node_id
    
    # 示範隱藏成就解鎖邏輯
    if node_id == 'secret_ending':
        Achievement.create(user['id'], 'SECRET_01')
        flash('恭喜！解鎖隱藏成就！', 'success')

    return render_template('story/play.html', user=user, story=story_data)
