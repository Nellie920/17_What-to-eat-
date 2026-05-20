import sys
import os
# 將專案根目錄加入路徑以便導入
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.models.models import db, Achievement

def initialize_database():
    app = create_app()
    with app.app_context():
        print("正在建立資料庫表結構...")
        db.create_all()
        print("資料表 `users`, `game_saves`, `achievements`, `user_achievements` 建立成功！")

        print("正在寫入預設成就種子資料...")
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
                print(f"已寫入成就種子：【{seed['title']}】")
            else:
                print(f"成就已存在，跳過寫入：【{seed['title']}】")

        db.session.commit()
        print("資料庫初始化完成！")

if __name__ == '__main__':
    initialize_database()
