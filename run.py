import os
import sqlite3
from flask import Flask
from app.routes import register_blueprints

def init_db(app):
    """初始化資料庫與資料表"""
    db_path = os.path.abspath(os.path.join(app.instance_path, 'database.db'))
    os.makedirs(app.instance_path, exist_ok=True)
    
    schema_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'database', 'schema.sql'))
    if os.path.exists(schema_path):
        with sqlite3.connect(db_path, timeout=30.0) as conn:
            with open(schema_path, 'r', encoding='utf-8') as f:
                conn.executescript(f.read())
            
            # 確保 users 資料表有 last_ending 欄位 (SQLite 結構移轉)
            try:
                conn.execute("ALTER TABLE users ADD COLUMN last_ending TEXT")
            except sqlite3.OperationalError:
                # 欄位已存在，忽略此錯誤
                pass
            
            conn.commit()

def create_app():
    # 確保 Flask 的 instance_path 使用專案根目錄的絕對路徑，防範工作目錄改變導致路徑不對
    root_dir = os.path.abspath(os.path.dirname(__file__))
    app = Flask('app', instance_path=os.path.join(root_dir, 'instance'))
    
    # 載入設定
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_secret_key')
    
    # 確保 instance 資料夾存在
    os.makedirs(app.instance_path, exist_ok=True)

    # 註冊所有的 Blueprint 路由
    register_blueprints(app)

    # 伺服器啟動時自動初始化資料庫結構
    with app.app_context():
        init_db(app)

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
