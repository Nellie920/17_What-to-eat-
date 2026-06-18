import os
from app import create_app
from app.models.models import db, Achievement

app = create_app()
with app.app_context():
    # Ensure DB is initialized (run the init code if not already)
    # Query all achievements
    achievements = Achievement.query.all()
    for ac in achievements:
        print(f"{ac.id}: {ac.title}")
    print(f"Total: {len(achievements)}")
