# 戀愛互動式故事網站 - F-05 成就解鎖系統說明文件

本說明文件旨在協助開發小組成員安裝、配置並運行由 **邱柏傑** 負責開發的 **F-05 成就解鎖系統**。本模組包含 SQLite 資料庫結構初始化、後端 Flask API 與前端純 JavaScript + CSS Toast 提示效果。

---

## 📂 檔案清單說明

本功能模組由以下四個核心檔案組成：

1. **`schema.sql`**：
   * 包含 `achievements`（儲存所有成就）與 `user_achievements`（儲存會員解鎖紀錄）的 SQLite 資料表建立腳本。
   * 已預先設定 `title` 為 `UNIQUE` 並使用 `INSERT OR IGNORE` 插入 3 筆測試成就資料（達成初次結局、找到隱藏彩蛋、母胎單身狗）。
2. **`app.py`**：
   * 後端 Flask 主程式，使用 Python 內建的 `sqlite3` 連線至本機的 `db17_love_story.db` 資料庫檔案。
   * **已加入自動初始化功能**：啟動時若發現資料庫檔案不存在，會自動讀取並執行 `schema.sql` 建立資料庫與測試資料，完全不需要手動建立資料庫！
   * 實作 `POST /api/achievement/unlock` 路由，能自動過濾重複解鎖的成就，並回傳對應的 JSON 狀態。
   * 提供根路由 `/` 託管並渲染前端測試頁面。
3. **`index.html`**：
   * 純前端靜態頁面（無任何網頁框架）。
   * 實作 JavaScript 函式 `unlockAchievement(userId, achievementId)` 進行非同步 API 串接。
   * 內建基於 CSS 動畫（Slide In & Fade Out）的美觀 Toast 彈出式提示框。
4. **`requirements.txt`**：
   * 記錄專案後端依賴的 Python 套件與對應版本（僅需安裝 Flask，SQLite 為 Python 內建，無需安裝額外驅動）。

---

## 🛠️ 環境配置與啟動步驟

由於改用 SQLite 輕量化檔案型資料庫，你不必在本機啟動任何 MySQL 伺服器，直接執行以下步驟即可啟動與測試：

### 第一步：安裝 Python 套件依賴
請確保本機已安裝 Python，並在專案根目錄下執行以下指令安裝所需套件（僅 Flask）：
```bash
pip install -r requirements.txt
```

### 第二步：啟動 Flask 服務
直接在專案根目錄中執行：
```bash
python app.py
```
*說明：執行後，程式會在同目錄下自動產生 `db17_love_story.db` 資料庫檔案，並自動執行 `schema.sql` 進行結構初始化與資料寫入。*

若成功啟動，終端機將會顯示服務正運行於 `http://127.0.0.1:5000/`。

### 第三步：進行功能測試
1. 在瀏覽器打開網址：[http://127.0.0.1:5000/](http://127.0.0.1:5000/)。
2. 頁面中包含三個成就測試按鈕：
   * **「解鎖成就：達成初次結局」** (ID: 1)
   * **「解鎖成就：找到隱藏彩蛋」** (ID: 2)
   * **「解鎖成就：母胎單身狗」** (ID: 3)
3. 點擊按鈕進行測試：
   * 首次點擊：網頁上方會向下**滑入 (Slide In)** 顯示 `🏆 恭喜獲得成就！` 提示框，停留 3 秒後自動**淡出 (Fade Out)** 消失。
   * 重複點擊：會透過 API 檢查，提示 `ℹ️ 已經解鎖過此成就了喔！`。

---

## 📊 API 規格說明

### 1. 成就解鎖 API

* **路徑**：`/api/achievement/unlock`
* **方法**：`POST`
* **請求格式**：`application/json`
* **參數**：
  ```json
  {
    "user_id": 1,
    "achievement_id": 1
  }
  ```
* **回應格式**：
  * **成功解鎖 (尚未解鎖過)**：
    ```json
    {
      "success": true,
      "message": "解鎖成功"
    }
    ```
  * **重複解鎖 (已解鎖過)**：
    ```json
    {
      "success": false,
      "message": "已解鎖過此成就"
    }
    ```
