from flask import Blueprint, request, render_template, redirect, url_for, session, flash
from app.models.user import User
from app.models.achievement import Achievement
from app.data.story_data import INITIAL_STATE, STORY_NODES, ENDINGS, parse_text
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

    return render_template('story/play.html', user=user, story=story_data, state=state)

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
                
    # 隨機性別處理
    next_node = choice.get('next')
    if next_node == 'random_gender':
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
    
    # 清除遊戲進度
    session.pop('game_state', None)
    
    return render_template('story/ending.html', user=user, ending=ending_data)
