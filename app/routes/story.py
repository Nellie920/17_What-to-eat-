from flask import Blueprint, request, render_template, redirect, url_for, session

story_bp = Blueprint('story', __name__)

@story_bp.route('/', methods=['GET'])
def home():
    """
    GET: 顯示登入後的主選單 (首頁)，包含「開始遊戲」、「讀取存檔」、「個人設定」等入口。
         需檢查 session 是否登入。
    """
    pass

@story_bp.route('/story/<node_id>', methods=['GET'])
def play_story(node_id):
    """
    GET: 根據 node_id 撈取並顯示對應的劇情文本、過場圖與選項分支。
         在此頁面渲染玩家自訂的 display_name，並處理隱藏成就解鎖邏輯。
    """
    pass
