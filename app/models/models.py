from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy

# 初始化 SQLAlchemy 實例，由 Flask App 於工廠方法中 init_app
db = SQLAlchemy()

# ==========================================
# 1. 用戶帳號模型 (F-01 - 侯欣妮)
# ==========================================
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 關聯關係
    saves = db.relationship('GameSave', backref='user', lazy=True, cascade="all, delete-orphan")
    unlocked_achievements = db.relationship('UserAchievement', backref='user', lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        """利用 PBKDF2 進行密碼雜湊加密"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """驗證密碼雜湊是否正確"""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        """序列化用戶資料 (排除密碼雜湊以防洩漏)"""
        return {
            'id': self.id,
            'username': self.username,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


# ==========================================
# 2. 存讀檔進度模型 (F-03: 陳姵羽, F-04: 廖奕臻, F-06: 吳禎晏)
# ==========================================
class GameSave(db.Model):
    __tablename__ = 'game_saves'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    save_name = db.Column(db.String(100), nullable=False)  # 玩家自訂的存檔區識別名
    current_node = db.Column(db.String(100), nullable=False)  # F-02: 劇本當前節點 ID
    
    # F-04: 個人化配置
    custom_player_name = db.Column(db.String(80), nullable=False, default='主角')
    ui_theme = db.Column(db.String(50), nullable=False, default='default-pink')
    
    # F-06: 多媒體播放狀態
    bgm_src = db.Column(db.String(200), nullable=True)  # 當前播放 BGM 檔案路徑
    bgm_position = db.Column(db.Float, nullable=False, default=0.0)  # 音軌播放秒數
    bgm_volume = db.Column(db.Float, nullable=False, default=0.5)  # 用戶 BGM 音量
    sfx_volume = db.Column(db.Float, nullable=False, default=0.8)  # 用戶 SFX 音量
    is_muted = db.Column(db.Boolean, nullable=False, default=False)  # 是否靜音
    
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        """序列化存檔資料，供前端故事引擎及存檔選單讀取"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'save_name': self.save_name,
            'current_node': self.current_node,
            'custom_player_name': self.custom_player_name,
            'ui_theme': self.ui_theme,
            'multimedia_state': {
                'bgm_src': self.bgm_src,
                'bgm_position': self.bgm_position,
                'bgm_volume': self.bgm_volume,
                'sfx_volume': self.sfx_volume,
                'is_muted': self.is_muted
            },
            'created_at': self.created_at.isoformat()
        }


# ==========================================
# 3. 成就主模型 (F-05 - 邱柏傑)
# ==========================================
class Achievement(db.Model):
    __tablename__ = 'achievements'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    icon_url = db.Column(db.String(200), nullable=True)  # 成就徽章圖片路徑
    points = db.Column(db.Integer, nullable=False, default=10)  # 成就積分
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        """序列化成就定義"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'icon_url': self.icon_url,
            'points': self.points
        }


# ==========================================
# 4. 用戶成就解鎖橋接模型 (F-05 - 邱柏傑)
# ==========================================
class UserAchievement(db.Model):
    __tablename__ = 'user_achievements'

    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    achievement_id = db.Column(db.Integer, db.ForeignKey('achievements.id', ondelete='CASCADE'), primary_key=True)
    unlocked_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # 關聯至成就主表，方便快速查詢解鎖成就詳情
    achievement = db.relationship('Achievement', backref='user_unlocks')

    def to_dict(self):
        """序列化玩家已解鎖成就明細"""
        return {
            'user_id': self.user_id,
            'achievement_id': self.achievement_id,
            'title': self.achievement.title if self.achievement else None,
            'description': self.achievement.description if self.achievement else None,
            'icon_url': self.achievement.icon_url if self.achievement else None,
            'points': self.achievement.points if self.achievement else 0,
            'unlocked_at': self.unlocked_at.isoformat()
        }
