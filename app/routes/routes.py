from flask import Blueprint, request, jsonify, session
from functools import wraps
from app.models.models import db, User, GameSave, Achievement, UserAchievement

# 定義各功能模組的 Blueprints
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
story_bp = Blueprint('story', __name__, url_prefix='/api/story')
saves_bp = Blueprint('saves', __name__, url_prefix='/api/saves')
achievements_bp = Blueprint('achievements', __name__, url_prefix='/api/achievements')

# ==========================================
# 0. 輔助裝飾器 (Auth Middleware)
# ==========================================
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({
                'status': 'error',
                'message': '請先登入系統後再進行操作。'
            }), 401
        return f(*args, **kwargs)
    return decorated_function


# ==========================================
# 1. 用戶認證路由組 (F-01 - 侯欣妮)
# ==========================================
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'status': 'error', 'message': '請輸入完整的帳號與密碼。'}), 400

    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({'status': 'error', 'message': '此帳號已被註冊。'}), 400

    try:
        new_user = User(username=username)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': '註冊成功！',
            'user': new_user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': f'註冊失敗：{str(e)}'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'status': 'error', 'message': '請輸入帳號與密碼。'}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({'status': 'error', 'message': '帳號或密碼輸入錯誤，請重試。'}), 401

    # 在伺服器端 Session 中寫入用戶識別
    session['user_id'] = user.id
    session.permanent = True  # 使 Session 具有長期效期

    return jsonify({
        'status': 'success',
        'message': '登入成功！',
        'user': user.to_dict()
    }), 200


@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({
        'status': 'success',
        'message': '已成功登出系統。'
    }), 200


@auth_bp.route('/session', methods=['GET'])
def get_session():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user:
            return jsonify({
                'status': 'success',
                'logged_in': True,
                'user': user.to_dict()
            }), 200
    
    return jsonify({
        'status': 'error',
        'logged_in': False,
        'message': '用戶目前處於未登入狀態。'
    }), 401


# ==========================================
# 2. 故事腳本路由組 (F-02 - 林永涵, F-06 - 吳禎晏)
# ==========================================
@story_bp.route('/nodes/<node_id>', methods=['GET'])
def get_story_node(node_id):
    """
    獲取單一劇本節點，此處整合多媒體播放欄位 (bgm、sfx、視覺特效)
    在實際專案中，劇本通常以 JSON 檔案儲存於靜態目錄 (app/data/)，
    此處示範路由骨架，可擴展為從資料庫或 JSON 檔案載入。
    """
    # 假資料範例，實際實作時可由林永涵撰寫 JSON 讀取邏輯
    mock_nodes = {
        "start": {
            "node_id": "start",
            "background_image": "/static/images/bg/lobby.jpg",
            "speaker": "系統旁白",
            "dialogue": "歡迎來到互動戀愛故事！等一下，要吃什麼呢？點擊前方開啟偶遇吧……",
            "bgm": "/static/audio/bgm/sweet_intro.mp3",
            "effects": [],
            "choices": [
                {"text": "前往櫻花公園", "next_node": "scene_cherry_01"}
            ]
        }
    }
    
    node = mock_nodes.get(node_id)
    if not node:
        # 當找不到指定節點時回傳預設結構或錯誤
        return jsonify({
            'status': 'error',
            'message': f'找不到指定的劇本節點：{node_id}'
        }), 404

    return jsonify({
        'status': 'success',
        'node': node
    }), 200


# ==========================================
# 3. 存讀檔與外觀/多媒體同步路由組 (F-03/04/06)
# ==========================================
@saves_bp.route('', methods=['GET'])
@login_required
def list_saves():
    user_id = session['user_id']
    saves = GameSave.query.filter_by(user_id=user_id).order_by(GameSave.created_at.desc()).all()
    return jsonify({
        'status': 'success',
        'saves': [save.to_dict() for save in saves]
    }), 200


@saves_bp.route('', methods=['POST'])
@login_required
def create_save():
    user_id = session['user_id']
    data = request.get_json() or {}

    save_name = data.get('save_name')
    current_node = data.get('current_node')

    if not save_name or not current_node:
        return jsonify({'status': 'error', 'message': '存檔名稱與故事節點不可為空。'}), 400

    try:
        # 解析 F-06 多媒體與 F-04 外觀細部狀態
        multimedia = data.get('multimedia_state', {})
        
        new_save = GameSave(
            user_id=user_id,
            save_name=save_name,
            current_node=current_node,
            custom_player_name=data.get('custom_player_name', '主角'),
            ui_theme=data.get('ui_theme', 'default-pink'),
            bgm_src=data.get('bgm_src'),
            bgm_position=data.get('bgm_position', 0.0),
            bgm_volume=data.get('bgm_volume', 0.5),
            sfx_volume=data.get('sfx_volume', 0.8),
            is_muted=data.get('is_muted', False)
        )

        db.session.add(new_save)
        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': '進度儲存成功！',
            'save_id': new_save.id
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': f'存檔失敗：{str(e)}'}), 500


@saves_bp.route('/<int:save_id>', methods=['GET'])
@login_required
def get_save(save_id):
    user_id = session['user_id']
    save = GameSave.query.filter_by(id=save_id, user_id=user_id).first()

    if not save:
        return jsonify({'status': 'error', 'message': '找不到此存檔，或無存取權限。'}), 404

    return jsonify({
        'status': 'success',
        'save': save.to_dict()
    }), 200


@saves_bp.route('/<int:save_id>', methods=['DELETE'])
@login_required
def delete_save(save_id):
    user_id = session['user_id']
    save = GameSave.query.filter_by(id=save_id, user_id=user_id).first()

    if not save:
        return jsonify({'status': 'error', 'message': '找不到此存檔，或無刪除權限。'}), 404

    try:
        db.session.delete(save)
        db.session.commit()
        return jsonify({
            'status': 'success',
            'message': '存檔已順利刪除。'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': f'刪除失敗：{str(e)}'}), 500


# ==========================================
# 4. 成就解鎖路由組 (F-05 - 邱柏傑)
# ==========================================
@achievements_bp.route('', methods=['GET'])
@login_required
def get_achievements():
    user_id = session['user_id']
    
    # 查出所有靜態成就定義
    all_achievements = Achievement.query.all()
    
    # 查出當前用戶已解鎖的成就集合
    unlocked_list = UserAchievement.query.filter_by(user_id=user_id).all()
    unlocked_ids = {ua.achievement_id for ua in unlocked_list}

    result = []
    for ac in all_achievements:
        ac_dict = ac.to_dict()
        ac_dict['unlocked'] = ac.id in unlocked_ids
        # 如果已解鎖，附帶解鎖時間
        if ac_dict['unlocked']:
            ua = next(u for u in unlocked_list if u.achievement_id == ac.id)
            ac_dict['unlocked_at'] = ua.unlocked_at.isoformat()
        else:
            ac_dict['unlocked_at'] = None
        result.append(ac_dict)

    return jsonify({
        'status': 'success',
        'achievements': result
    }), 200


@achievements_bp.route('/unlock', methods=['POST'])
@login_required
def unlock_achievement():
    user_id = session['user_id']
    data = request.get_json() or {}
    achievement_id = data.get('achievement_id')

    if not achievement_id:
        return jsonify({'status': 'error', 'message': '請提供欲解鎖的成就識別碼。'}), 400

    ac = Achievement.query.get(achievement_id)
    if not ac:
        return jsonify({'status': 'error', 'message': '找不到指定的成就定義。'}), 404

    # 檢查是否已經解鎖過
    existing_unlock = UserAchievement.query.filter_by(user_id=user_id, achievement_id=achievement_id).first()
    if existing_unlock:
        return jsonify({
            'status': 'success',
            'message': '此成就之前已解鎖過。',
            'already_unlocked': True
        }), 200

    try:
        new_unlock = UserAchievement(user_id=user_id, achievement_id=achievement_id)
        db.session.add(new_unlock)
        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': f'恭喜解鎖成就：【{ac.title}】！',
            'achievement': ac.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': f'解鎖失敗：{str(e)}'}), 500
