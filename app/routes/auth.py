from flask import Blueprint, request, render_template, redirect, url_for, session, flash

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    """
    GET: 顯示註冊表單頁面。
    POST: 接收表單資料 (username, password)，建立使用者帳號並導向登入頁。
          若帳號已存在或密碼格式不符，則返回錯誤訊息。
    """
    pass

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """
    GET: 顯示登入表單頁面。
    POST: 驗證帳號密碼，成功則將 user_id 寫入 session 並導向首頁，
          失敗則返回錯誤訊息重新渲染登入頁。
    """
    pass

@auth_bp.route('/logout', methods=['GET'])
def logout():
    """
    GET: 清除 session 中的 user_id 紀錄，並導向登入頁面。
    """
    pass
