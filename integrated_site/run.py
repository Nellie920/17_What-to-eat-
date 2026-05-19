import os
import sqlite3
from flask import Flask
from app.routes import register_blueprints

def init_db(app):
    """初始化資料庫與資料表"""
    db_path = os.path.join(app.instance_path, 'database.db')
    os.makedirs(app.instance_path, exist_ok=True)
    
    schema_path = os.path.join(os.path.dirname(__file__), 'database', 'schema.sql')
    if os.path.exists(schema_path):
        with sqlite3.connect(db_path) as conn:
            with open(schema_path, 'r', encoding='utf-8') as f:
                conn.executescript(f.read())
            conn.commit()

def create_app():
    app = Flask('app')
    
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

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
