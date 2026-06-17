import os
from flask import Flask
from app.models.models import db

def create_app():
    # 建立 Flask 應用程式實例，指定 templates 與 static 的正確路徑
    app = Flask(__name__, 
                template_folder='templates',
                static_folder='static')
    
    # 基本配置項目
    app.config['SECRET_KEY'] = 'romantic-dev-secret-key-17'
    
    # 設定 SQLite 資料庫連線路徑 (放置於專案根目錄的 database 目錄)
    db_dir = os.path.join(app.root_path, '..', 'database')
    os.makedirs(db_dir, exist_ok=True)
    db_path = os.path.abspath(os.path.join(db_dir, 'story.db'))
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # 初始化 SQLAlchemy db 實例
    db.init_app(app)
    
    with app.app_context():
        try:
            from sqlalchemy import text
            db.session.execute(text("DELETE FROM achievements WHERE title='找到隱藏彩蛋'"))
            db.session.commit()
        except Exception:
            db.session.rollback()

    # 註冊多個功能模組的 Blueprints 路由
    from app.routes.routes import auth_bp, story_bp, saves_bp, achievements_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(story_bp)
    app.register_blueprint(saves_bp)
    app.register_blueprint(achievements_bp)

    return app
