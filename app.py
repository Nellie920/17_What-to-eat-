from flask import render_template
from app import create_app

app = create_app()

# 提供主視圖 SPA 入口
@app.route('/')
def home():
    return render_template('index.html')

if __name__ == '__main__':
    # 預設本地開發運行於 5000 埠
    app.run(debug=True, port=5000)
