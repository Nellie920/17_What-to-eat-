from flask import Blueprint, request, render_template, redirect, url_for, session, flash

save_bp = Blueprint('save', __name__)

@save_bp.route('/saves', methods=['GET'])
def list_saves():
    """
    GET: 撈取資料庫中該玩家的所有存檔紀錄清單，並顯示於畫面上。
    """
    pass

@save_bp.route('/saves/create', methods=['POST'])
def create_save():
    """
    POST: 接收來自前端表單的 node_id，為目前玩家建立一筆新的存檔紀錄，
          完成後附帶 flash 成功訊息並重導向回目前的劇情節點。
    """
    pass

@save_bp.route('/saves/<int:save_id>/load', methods=['POST'])
def load_save(save_id):
    """
    POST: 讀取指定 ID 的存檔，取得該存檔紀錄的 node_id 後，
          重導向至 /story/<node_id> 以繼續遊戲。
    """
    pass

@save_bp.route('/saves/<int:save_id>/delete', methods=['POST'])
def delete_save(save_id):
    """
    POST: 刪除指定的存檔紀錄，完成後重導向回存檔清單頁面。
    """
    pass
