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

    # 伺服器啟動時自動初始化資料庫結構與種子資料
    with app.app_context():
        try:
            db.create_all()
            from app.models.models import Achievement
            seeds = [
                {
                    "title": "踏出第一步",
                    "description": "首次在劇本做出任何劇情抉擇。",
                    "icon_url": "/static/images/achievements/step_one.png",
                    "points": 10
                },
                {
                    "title": "戀愛大師",
                    "description": "達成專案中任一 Happy Ending 結局。",
                    "icon_url": "/static/images/achievements/happy_end.png",
                    "points": 30
                },
                {
                    "title": "遺憾的美好",
                    "description": "達成第一個 Sad Ending 結局。",
                    "icon_url": "/static/images/achievements/sad_end.png",
                    "points": 20
                },
                {
                    "title": "音律沉浸者",
                    "description": "在設定中調整過音量或靜音開關。",
                    "icon_url": "/static/images/achievements/music_lover.png",
                    "points": 10
                },
                {
                    "title": "百變主角",
                    "description": "自訂角色暱稱並更換介面主題。",
                    "icon_url": "/static/images/achievements/custom_hero.png",
                    "points": 15
                }
            ]
            for seed in seeds:
                existing = Achievement.query.filter_by(title=seed["title"]).first()
                if not existing:
                    new_ac = Achievement(
                        title=seed["title"],
                        description=seed["description"],
                        icon_url=seed["icon_url"],
                        points=seed["points"]
                    )
                    db.session.add(new_ac)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Database auto-initialization or seeding failed: {e}")

    # 註冊多個功能模組的 Blueprints 路由
    from app.routes.routes import auth_bp, story_bp, saves_bp, achievements_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(story_bp)
    app.register_blueprint(saves_bp)
    app.register_blueprint(achievements_bp)

    return app
