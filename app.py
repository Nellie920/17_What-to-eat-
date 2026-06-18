from flask import render_template
from app import create_app

app = create_app()

# 提供主視圖 SPA 入口
@app.route('/')
def home():
    import os
    images_path = os.path.join(app.root_path, 'static', 'images', 'characters')
    character_images = [f for f in os.listdir(images_path) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))]
    return render_template('index.html', character_images=character_images)

if __name__ == '__main__':
    # 預設本地開發運行於 5000 埠
    app.run(debug=True, port=5000)
