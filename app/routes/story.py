import os
import json
from flask import Blueprint, request, render_template, redirect, url_for, session, flash, current_app, jsonify
from app.models.user import User
from app.models.achievement import Achievement
from app.data.story_data import INITIAL_STATE, STORY_NODES, ENDINGS, CHARACTERS, parse_text
import random

story_bp = Blueprint('story', __name__)

def init_game_state():
    session['game_state'] = INITIAL_STATE.copy()

@story_bp.route('/', methods=['GET'])
def home():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    
    user = User.get_by_id(session['user_id'])
    return render_template('story/home.html', user=user)

@story_bp.route('/story/start', methods=['POST'])
def start_story():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    init_game_state()
    return redirect(url_for('story.play_story', node_id='start'))

@story_bp.route('/story/<node_id>', methods=['GET'])
def play_story(node_id):
    if 'user_id' not in session:
        flash('請先登入以進行遊戲。', 'warning')
        return redirect(url_for('auth.login'))
    
    user = User.get_by_id(session['user_id'])
    
    if 'game_state' not in session:
        init_game_state()
    
    state = session['game_state']
    
    # 邏輯匯流點處理
    if node_id == 'eval_chapter3':
        target_key = state.get('targetKey')
        if state.get('curiosity', 0) >= 2 or state.get('followed_target', False):
            return redirect(url_for('story.play_story', node_id=f'memory_{target_key}'))
        else:
            return redirect(url_for('story.play_story', node_id=f'memory_alt_{target_key}'))
            
    if node_id == 'eval_ending':
        return redirect(url_for('story.show_ending'))
        
    if node_id not in STORY_NODES:
        flash('找不到該劇情節點', 'danger')
        return redirect(url_for('story.home'))
        
    node = STORY_NODES[node_id]
    target_key = state.get('targetKey')
    
    story_data = {
        'node_id': node_id,
        'text': parse_text(node['text'], target_key),
        'choices': []
    }
    
    for idx, choice in enumerate(node['choices']):
        story_data['choices'].append({
            'id': idx,
            'text': parse_text(choice['text'], target_key)
        })

    # ========================================================
    # 沉浸式多媒體主線整合核心 (BGM, 背景, 特效動態分配)
    # ========================================================
    bg_image = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200" # 預設大廳
    bgm = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" # 預設前奏
    speaker = "系統廣播"
    effects = []
    
    # 偵測是否為攻略對象相關節點
    target_key_detected = None
    for key in CHARACTERS.keys():
        if f"_{key}" in node_id or key in node_id:
            target_key_detected = key
            break
            
    if target_key_detected:
        speaker = CHARACTERS[target_key_detected]['name']
        
        # 根據不同的攻略對象，載入個性化的高級 Unsplash 浪漫背景圖與專屬 BGM 連結
        bg_configs = {
            'm1': {
                'bg': 'https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?q=80&w=1200', # 洛頁彥：夕陽滑板大道
                'bgm': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' # 熱血輕快
            },
            'm2': {
                'bg': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200', # 齊勻楠：沉穩理性的湛藍科技室
                'bgm': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' # 爵士Lofi
            },
            'm3': {
                'bg': 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200', # 秦陌寂：溫馨的木質圖書館
                'bgm': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' # 溫柔木吉他
            },
            'f1': {
                'bg': 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=1200', # 田媛寧：百花盛開的秘密花園
                'bgm': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' # 恬靜鋼琴
            },
            'f2': {
                'bg': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1200', # 張栖鈴：高貴幽雅的夢幻紫羅蘭沙龍
                'bgm': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' # 華麗圓舞曲
            },
            'f3': {
                'bg': 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=1200', # 顧音棉：甜美俏皮的櫻粉派對空間
                'bgm': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' # 歡樂電子樂
            }
        }
        
        if target_key_detected in bg_configs:
            bg_image = bg_configs[target_key_detected]['bg']
            bgm = bg_configs[target_key_detected]['bgm']
            
    # 特殊章節節點背景與 BGM 設定
    if node_id == 'start':
        speaker = "系統廣播"
        bg_image = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200"
        bgm = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    elif node_id in ['select_target_m', 'select_target_f', 'node_hl_gender']:
        speaker = "命運指引者"
        bg_image = "https://images.unsplash.com/photo-1453614512568-c4024d13c247?q=80&w=1200" # 咖啡館
        bgm = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        
    # 特殊情感值觸發的特效與音效 (F-06 Ducking & effects 整合)
    if 'memory' in node_id:
        bg_image = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200" # 溫馨大餐
        effects.append({ "type": "flash", "color": "rgba(255, 182, 193, 0.4)", "delay": 200 })
        effects.append({ "type": "sfx", "src": "https://actions.google.com/sounds/v1/ui/beep_short.ogg", "delay": 300 })
    elif 'aftermath' in node_id:
        effects.append({ "type": "shake", "target": "body", "delay": 100 })
        
    # 自動成就解鎖判定 (F-05)
    auto_unlock_achievement_id = None
    if node_id == 'start':
        auto_unlock_achievement_id = 1 # 踏出第一步
    elif 'memory' in node_id:
        auto_unlock_achievement_id = 2 # 戀愛大師
        
    if auto_unlock_achievement_id and user:
        try:
            Achievement.create(user['id'], str(auto_unlock_achievement_id))
        except Exception as e:
            print(f"Auto unlock failed: {e}")

    # 以 JSON 字串傳遞 effects list，防範 Jinja 解譯 JS 物件錯誤
    effects_json = json.dumps(effects)

    return render_template(
        'story/play.html', 
        user=user, 
        story=story_data, 
        state=state, 
        background_image=bg_image,
        bgm=bgm,
        effects_json=effects_json,
        speaker=speaker
    )

@story_bp.route('/story/<node_id>/choice/<int:choice_id>', methods=['POST'])
def make_choice(node_id, choice_id):
    if 'user_id' not in session or 'game_state' not in session:
        return redirect(url_for('auth.login'))
        
    state = session['game_state']
    node = STORY_NODES.get(node_id)
    if not node or choice_id >= len(node['choices']):
        return redirect(url_for('story.home'))
        
    choice = node['choices'][choice_id]
    
    # 角色選擇
    if 'targetKey' in choice:
        state['targetKey'] = choice['targetKey']
        
    # 數值變更
    if 'statChange' in choice:
        for k, v in choice['statChange'].items():
            if type(v) == bool:
                state[k] = v
            else:
                state[k] = state.get(k, 0) + v
                
    # 儲存兩層選擇性別並解析隨機性別
    if node_id == 'start':
        gender_map = {0: 'm', 1: 'f', 2: 'random'}
        state['target_gender'] = gender_map.get(choice_id, 'random')
    elif node_id == 'node_hl_gender':
        gender_map = {0: 'm', 1: 'f', 2: 'random'}
        state['player_gender'] = gender_map.get(choice_id, 'random')
        
        # 解析隨機攻略對象性別
        t_gender = state.get('target_gender', 'random')
        if t_gender == 'random':
            t_gender = 'm' if random.random() > 0.5 else 'f'
            state['target_gender'] = t_gender
            
        # 解析隨機玩家自己性別
        p_gender = state.get('player_gender', 'random')
        if p_gender == 'random':
            p_gender = 'm' if random.random() > 0.5 else 'f'
            state['player_gender'] = p_gender

    # 隨機性別處理與下一個節點跳轉
    next_node = choice.get('next')
    if node_id == 'node_hl_gender':
        next_node = 'select_target_m' if state.get('target_gender') == 'm' else 'select_target_f'
    elif next_node == 'random_gender':
        next_node = 'select_target_m' if random.random() > 0.5 else 'select_target_f'
        
    # 更新 session
    session.modified = True
    
    if next_node:
        return redirect(url_for('story.play_story', node_id=next_node))
    return redirect(url_for('story.home'))

@story_bp.route('/story/ending', methods=['GET'])
def show_ending():
    if 'user_id' not in session or 'game_state' not in session:
        return redirect(url_for('auth.login'))
        
    state = session['game_state']
    user = User.get_by_id(session['user_id'])
    
    end_key = 'end_normal'
    if state.get('abandoned_partner'):
        end_key = 'end_comedy'
    elif state.get('fear', 0) >= 3 and state.get('trust', 0) <= 2:
        end_key = 'end_bad'
    elif state.get('trust', 0) >= 5 and state.get('affection', 0) >= 5 and state.get('recovered_memory'):
        end_key = 'end_true'
    elif state.get('affection', 0) >= 4 and state.get('trust', 0) >= 3:
        end_key = 'end_good'
        
    target_key = state.get('targetKey', 'm1') # 預設 fallback
    
    if target_key in ENDINGS:
        ending = ENDINGS[target_key][end_key]
    else:
        ending = ENDINGS['m1'][end_key] # Fallback
    
    ending_data = {
        'title': ending['title'],
        'desc': ending['desc']
    }
    
    # 自動判定結局成就解鎖 (Happy End / Sad End)
    if end_key == 'end_true' or end_key == 'end_good':
        try:
            Achievement.create(user['id'], '2') # 戀愛大師
        except: pass
    elif end_key == 'end_bad':
        try:
            Achievement.create(user['id'], '3') # 遺憾的美好
        except: pass
    
    # 清除遊戲進度
    session.pop('game_state', None)
    
    return render_template('story/ending.html', user=user, ending=ending_data)


