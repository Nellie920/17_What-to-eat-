from flask import Blueprint, request, render_template, redirect, url_for, session, flash, jsonify
from app.models.save import Save

save_bp = Blueprint('save', __name__)

@save_bp.route('/saves', methods=['GET'])
def list_saves():
    """
    GET: 撈取資料庫中該玩家的所有存檔紀錄清單，並顯示於畫面上。
    """
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    
    saves = Save.get_all_by_user(session['user_id'])
    return render_template('save/list.html', saves=saves)

@save_bp.route('/saves/create', methods=['POST'])
def create_save():
    """
    POST: 接收來自前端表單的 node_id，為目前玩家建立一筆新的存檔紀錄，
          完成後附帶 flash 成功訊息並重導向回目前的劇情節點。
    """
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    
    node_id = request.form.get('node_id')
    if not node_id:
        flash('無法取得存檔節點。', 'danger')
        return redirect(url_for('story.home'))
        
    save_id = Save.create(session['user_id'], node_id)
    if save_id:
        flash('存檔成功！', 'success')
    else:
        flash('存檔失敗，請稍後再試。', 'danger')
        
    return redirect(url_for('story.play_story', node_id=node_id))

@save_bp.route('/saves/<int:save_id>/load', methods=['POST'])
def load_save(save_id):
    """
    POST: 讀取指定 ID 的存檔，取得該存檔紀錄的 node_id 後，
          重導向至 /story/<node_id> 以繼續遊戲。
    """
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
        
    save_record = Save.get_by_id(save_id)
    if not save_record or save_record['user_id'] != session['user_id']:
        flash('找不到該存檔紀錄或您無權限讀取。', 'danger')
        return redirect(url_for('save.list_saves'))
        
    # 同步更新 Flask session['game_state']
    session['game_state'] = save_record.get('saved_state', {})
    session.modified = True
        
    flash('讀取進度成功！', 'success')
    return redirect(url_for('story.play_story', node_id=save_record['node_id']))

@save_bp.route('/saves/<int:save_id>/delete', methods=['POST'])
def delete_save(save_id):
    """
    POST: 刪除指定的存檔紀錄，完成後重導向回存檔清單頁面。
    """
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
        
    save_record = Save.get_by_id(save_id)
    if not save_record or save_record['user_id'] != session['user_id']:
        flash('找不到該存檔紀錄或您無權限刪除。', 'danger')
        return redirect(url_for('save.list_saves'))
        
    if Save.delete(save_id):
        flash('刪除存檔成功。', 'success')
    else:
        flash('刪除存檔失敗。', 'danger')
        
    return redirect(url_for('save.list_saves'))

# ========================================================
# JSON API 路由 (供懸浮 Widget 與 沉浸式 SPA 模式使用)
# ========================================================

# 1. 舊版懸浮 Widget 對接 API
@save_bp.route('/api/save', methods=['POST'])
def api_create_save():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    data = request.json or {}
    node_id = data.get('current_node')
    chapter = data.get('current_chapter', 1)
    saved_state = data.get('saved_state', {})
    
    if not node_id:
        return jsonify({'success': False, 'message': 'node_id is required'}), 400
        
    save_id = Save.create(session['user_id'], node_id, chapter, saved_state)
    if save_id:
        return jsonify({'success': True, 'data': {'progress_id': save_id}}), 201
    return jsonify({'success': False, 'message': 'Save failed'}), 500

@save_bp.route('/api/saves/<int:player_id>', methods=['GET'])
def api_list_saves(player_id):
    if 'user_id' not in session or session['user_id'] != player_id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    saves = Save.get_all_by_user(player_id)
    formatted_saves = []
    for s in saves:
        formatted_saves.append({
            'progress_id': s['id'],
            'current_chapter': s.get('chapter', 1),
            'current_node': s['node_id'],
            'last_played_at': s['saved_at'],
            'saved_state': s.get('saved_state', {})
        })
    return jsonify({'success': True, 'data': formatted_saves}), 200

@save_bp.route('/api/load/<int:save_id>', methods=['GET'])
def api_load_save(save_id):
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
        
    save_record = Save.get_by_id(save_id)
    if not save_record or save_record['user_id'] != session['user_id']:
        return jsonify({'success': False, 'message': 'Save not found'}), 404
        
    # 同步更新 Flask session['game_state']
    session['game_state'] = save_record.get('saved_state', {})
    session.modified = True
        
    formatted = {
        'progress_id': save_record['id'],
        'current_chapter': save_record.get('chapter', 1),
        'current_node': save_record['node_id'],
        'last_played_at': save_record['saved_at'],
        'saved_state': save_record.get('saved_state', {})
    }
    return jsonify({'success': True, 'data': formatted}), 200

# 2. 新版沉浸式 SPA 模式對接 API (相容 SQLAlchemy to dict 格式)
@save_bp.route('/api/saves', methods=['POST'])
def api_spa_create_save():
    if 'user_id' not in session:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
    
    data = request.get_json() or {}
    save_name = data.get('save_name')
    current_node = data.get('current_node')
    
    if not save_name or not current_node:
        return jsonify({'status': 'error', 'message': '存檔名稱與故事節點不可為空。'}), 400
        
    # 封裝多媒體與外觀狀態寫入 JSON state
    saved_state = {
        'save_name': save_name,
        'custom_player_name': data.get('custom_player_name', '主角'),
        'ui_theme': data.get('ui_theme', 'default-pink'),
        'multimedia_state': {
            'bgm_src': data.get('bgm_src'),
            'bgm_position': data.get('bgm_position', 0.0),
            'bgm_volume': data.get('bgm_volume', 0.5),
            'sfx_volume': data.get('sfx_volume', 0.8),
            'is_muted': data.get('is_muted', False)
        }
    }
    
    save_id = Save.create(session['user_id'], current_node, chapter=1, saved_state=saved_state)
    if save_id:
        return jsonify({
            'status': 'success',
            'message': '進度儲存成功！',
            'id': save_id
        }), 201
    return jsonify({'status': 'error', 'message': '存檔失敗'}), 500

@save_bp.route('/api/saves', methods=['GET'])
def api_spa_list_saves():
    if 'user_id' not in session:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
        
    saves = Save.get_all_by_user(session['user_id'])
    result = []
    for s in saves:
        st = s.get('saved_state') or {}
        # 若之前是用舊懸浮 Widget 存的，可能沒有這些欄位，我們提供安全預設
        result.append({
            'id': s['id'],
            'save_name': st.get('save_name', f"存檔 #{s['id']}"),
            'current_node': s['node_id'],
            'custom_player_name': st.get('custom_player_name', '主角'),
            'ui_theme': st.get('ui_theme', 'default-pink'),
            'multimedia_state': st.get('multimedia_state', {
                'bgm_src': None,
                'bgm_position': 0.0,
                'bgm_volume': 0.5,
                'sfx_volume': 0.8,
                'is_muted': False
            }),
            'created_at': s['saved_at']
        })
    return jsonify({
        'status': 'success',
        'saves': result
    }), 200

@save_bp.route('/api/saves/<int:save_id>', methods=['GET'])
def api_spa_get_save(save_id):
    if 'user_id' not in session:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
        
    save_record = Save.get_by_id(save_id)
    if not save_record or save_record['user_id'] != session['user_id']:
        return jsonify({'status': 'error', 'message': '存檔不存在或無權限存取。'}), 404
        
    st = save_record.get('saved_state') or {}
    formatted = {
        'id': save_record['id'],
        'save_name': st.get('save_name', f"存檔 #{save_record['id']}"),
        'current_node': save_record['node_id'],
        'custom_player_name': st.get('custom_player_name', '主角'),
        'ui_theme': st.get('ui_theme', 'default-pink'),
        'multimedia_state': st.get('multimedia_state', {
            'bgm_src': None,
            'bgm_position': 0.0,
            'bgm_volume': 0.5,
            'sfx_volume': 0.8,
            'is_muted': False
        }),
        'created_at': save_record['saved_at']
    }
    return jsonify({
        'status': 'success',
        'save': formatted
    }), 200

@save_bp.route('/api/saves/<int:save_id>', methods=['DELETE'])
def api_spa_delete_save(save_id):
    if 'user_id' not in session:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
        
    save_record = Save.get_by_id(save_id)
    if not save_record or save_record['user_id'] != session['user_id']:
        return jsonify({'status': 'error', 'message': '存檔不存在或無權限刪除。'}), 404
        
    if Save.delete(save_id):
        return jsonify({
            'status': 'success',
            'message': '存檔已順利刪除。'
        }), 200
    return jsonify({'status': 'error', 'message': '刪除失敗'}), 500

