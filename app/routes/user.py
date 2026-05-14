from flask import Blueprint, request, render_template, redirect, url_for, session, flash

user_bp = Blueprint('user', __name__)

@user_bp.route('/settings', methods=['GET'])
def settings():
    """
    GET: 顯示個人化設定頁面，包含更改角色名稱 (display_name) 與佈景主題 (theme) 的表單。
    """
    pass

@user_bp.route('/settings/update', methods=['POST'])
def update_settings():
    """
    POST: 接收設定表單資料，更新資料庫中使用者的設定，
          並附帶 flash 成功訊息後重導向回設定頁面。
    """
    pass

@user_bp.route('/achievements', methods=['GET'])
def achievements():
    """
    GET: 撈取玩家在資料庫中的解鎖紀錄，並顯示已解鎖與未解鎖的成就清單。
    """
    pass
