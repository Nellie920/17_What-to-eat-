from flask import Blueprint, request, render_template, redirect, url_for, session, flash
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
