from flask import Flask

def register_blueprints(app: Flask):
    from .auth import auth_bp
    from .story import story_bp
    from .save import save_bp
    from .user import user_bp
    from .dashboard import dashboard_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(story_bp)
    app.register_blueprint(save_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(dashboard_bp)

