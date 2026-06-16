from flask import Blueprint, request, render_template, redirect, url_for, session, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app.models.user import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    """
    GET: 顯示註冊表單頁面。
    POST: 接收表單資料 (username, password)，建立使用者帳號並導向登入頁。
          若帳號已存在或密碼格式不符，則返回錯誤訊息。
    """
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        if not username or not password:
            flash('帳號與密碼為必填欄位。', 'danger')
            return render_template('auth/register.html')

        # 檢查帳號是否已存在
        existing_user = User.get_by_username(username)
        if existing_user:
            flash('此帳號已被註冊，請嘗試其他帳號。', 'danger')
            return render_template('auth/register.html')

        hashed_password = generate_password_hash(password)
        user_id = User.create(username, hashed_password)

        if user_id:
            flash('註冊成功！請登入。', 'success')
            return redirect(url_for('auth.login'))
        else:
            flash('註冊時發生錯誤，請稍後再試。', 'danger')

    return render_template('auth/register.html')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """
    GET: 顯示登入表單頁面。
    POST: 驗證帳號密碼，成功則將 user_id 寫入 session 並導向首頁，
          失敗則返回錯誤訊息重新渲染登入頁。
    """
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        if not username or not password:
            flash('帳號與密碼為必填欄位。', 'danger')
            return render_template('auth/login.html')

        user = User.get_by_username(username)
        if user and check_password_hash(user['password_hash'], password):
            session['user_id'] = user['id']
            flash('登入成功！', 'success')
            return redirect(url_for('story.home'))
        else:
            flash('帳號或密碼錯誤。', 'danger')

    return render_template('auth/login.html')

@auth_bp.route('/logout', methods=['GET'])
def logout():
    """
    GET: 清除 session 中的 user_id 紀錄，並導向登入頁面。
    """
    session.pop('user_id', None)
    flash('您已成功登出。', 'info')
    return redirect(url_for('auth.login'))

# ========================================================
# JSON API 路由 (供沉浸式 SPA 模式使用)
# ========================================================

@auth_bp.route('/api/auth/login', methods=['POST'])
def api_login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'status': 'error', 'message': '請輸入帳號與密碼。'}), 400

    user = User.get_by_username(username)
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'status': 'error', 'message': '帳號或密碼輸入錯誤，請重試。'}), 401

    session['user_id'] = user['id']
    session.permanent = True

    return jsonify({
        'status': 'success',
        'message': '登入成功！',
        'user': {'id': user['id'], 'username': user['username']}
    }), 200

@auth_bp.route('/api/auth/register', methods=['POST'])
def api_register():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'status': 'error', 'message': '請設定帳號與密碼。'}), 400

    existing_user = User.get_by_username(username)
    if existing_user:
        return jsonify({'status': 'error', 'message': '此帳號已被註冊，請更換帳號。'}), 400

    hashed_password = generate_password_hash(password)
    user_id = User.create(username, hashed_password)

    if not user_id:
        return jsonify({'status': 'error', 'message': '註冊失敗，請稍後再試。'}), 500

    session['user_id'] = user_id
    session.permanent = True

    return jsonify({
        'status': 'success',
        'message': '註冊成功！',
        'user': {'id': user_id, 'username': username}
    }), 200

@auth_bp.route('/api/auth/session', methods=['GET'])
def api_session():
    if 'user_id' in session:
        user = User.get_by_id(session['user_id'])
        if user:
            return jsonify({
                'status': 'success',
                'logged_in': True,
                'user': {'id': user['id'], 'username': user['username']}
            }), 200
    
    return jsonify({
        'status': 'error',
        'logged_in': False,
        'message': '用戶目前處於未登入狀態。'
    }), 401

@auth_bp.route('/api/auth/logout', methods=['POST'])
def api_logout():
    session.pop('user_id', None)
    return jsonify({
        'status': 'success',
        'message': '已成功登出系統。'
    }), 200

