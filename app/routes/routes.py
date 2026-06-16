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
    此處示範路由骨架，已擴展為從 STORY_NODES 載入。
    """
    from app.data.story_data import STORY_NODES, CHARACTERS, ENDINGS

    # 1. 邏輯匯流點處理
    if node_id == 'eval_chapter3':
        state = session.get('game_state', {})
        target_key = state.get('targetKey', 'm1')
        if state.get('curiosity', 0) >= 2 or state.get('followed_target', False):
            node_id = f'memory_{target_key}'
        else:
            node_id = f'memory_alt_{target_key}'

    if node_id == 'eval_ending':
        state = session.get('game_state', {})
        end_key = 'end_normal'
        if state.get('abandoned_partner'):
            end_key = 'end_comedy'
        elif state.get('fear', 0) >= 3 and state.get('trust', 0) <= 2:
            end_key = 'end_bad'
        elif state.get('trust', 0) >= 5 and state.get('affection', 0) >= 5 and state.get('recovered_memory'):
            end_key = 'end_true'
        elif state.get('affection', 0) >= 5 or (state.get('affection', 0) >= 4 and state.get('trust', 0) >= 3):
            end_key = 'end_good'
            
        target_key = state.get('targetKey', 'm1')
        ending = ENDINGS.get(target_key, ENDINGS['m1']).get(end_key, ENDINGS['m1']['end_normal'])
        
        response_node = {
            "node_id": "eval_ending",
            "background_image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200",
            "speaker": "故事結局",
            "dialogue": f"🎉 達成結局：{ending['title']}\n{ending['desc']}",
            "bgm": "/static/audio/bgm/sweet_intro.wav",
            "effects": [{ "type": "flash", "color": "rgba(241,196,15,0.3)", "delay": 200 }],
            "choices": [
                {
                    "text": "🌸 重新開始心動旅程",
                    "next_node": "start",
                    "sfx_on_hover": "/static/audio/sfx/bubble_hover.wav",
                    "sfx_on_click": "/static/audio/sfx/select_confirm.wav"
                }
            ]
        }
        return jsonify({
            'status': 'success',
            'node': response_node
        }), 200

    node = STORY_NODES.get(node_id)
    if not node:
        return jsonify({
            'status': 'error',
            'message': f'找不到指定的劇本節點：{node_id}'
        }), 404

    # 2. 獲取角色與多媒體等配置
    bg_image = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200"
    bgm = "/static/audio/bgm/sweet_intro.wav"
    speaker = "系統旁白"
    effects = []
    
    target_key_detected = None
    for key in CHARACTERS.keys():
        if f"_{key}" in node_id or key in node_id:
            target_key_detected = key
            break
            
    if target_key_detected:
        speaker = CHARACTERS[target_key_detected]['name']
        bg_configs = {
            'm1': {
                'bg': 'https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?q=80&w=1200',
                'bgm': '/static/audio/bgm/romantic_piano.wav'
            },
            'm2': {
                'bg': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200',
                'bgm': '/static/audio/bgm/tension_loop.wav'
            },
            'm3': {
                'bg': 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200',
                'bgm': '/static/audio/bgm/romantic_piano.wav'
            },
            'f1': {
                'bg': 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=1200',
                'bgm': '/static/audio/bgm/romantic_piano.wav'
            },
            'f2': {
                'bg': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1200',
                'bgm': '/static/audio/bgm/tension_loop.wav'
            },
            'f3': {
                'bg': 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=1200',
                'bgm': '/static/audio/bgm/sweet_intro.wav'
            }
        }
        if target_key_detected in bg_configs:
            bg_image = bg_configs[target_key_detected]['bg']
            bgm = bg_configs[target_key_detected]['bgm']

    if node_id == 'start':
        speaker = "系統旁白"
        bg_image = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200"
        bgm = "/static/audio/bgm/sweet_intro.wav"
    elif node_id in ['select_target_m', 'select_target_f', 'node_hl_gender', 'confirm_selection']:
        speaker = "命運指引者"
        bg_image = "https://images.unsplash.com/photo-1453614512568-c4024d13c247?q=80&w=1200"
        bgm = "/static/audio/bgm/sweet_intro.wav"

    if 'memory' in node_id:
        bg_image = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200"
        effects.append({ "type": "flash", "color": "rgba(255, 182, 193, 0.4)", "delay": 200 })
        effects.append({ "type": "sfx", "src": "/static/audio/sfx/select_confirm.wav", "delay": 300 })
    elif 'aftermath' in node_id:
        effects.append({ "type": "shake", "target": "body", "delay": 100 })

    # 3. 格式化 choices
    formatted_choices = []
    for choice in node.get('choices', []):
        formatted_choices.append({
            'text': choice.get('text'),
            'next_node': choice.get('next'),
            'sfx_on_hover': "/static/audio/sfx/bubble_hover.wav",
            'sfx_on_click': "/static/audio/sfx/select_confirm.wav"
        })

    response_node = {
        "node_id": node_id,
        "background_image": bg_image,
        "speaker": speaker,
        "dialogue": node.get('text'),
        "bgm": bgm,
        "effects": effects,
        "choices": formatted_choices
    }

    return jsonify({
        'status': 'success',
        'node': response_node
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
