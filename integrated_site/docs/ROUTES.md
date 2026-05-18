# 路由設計文件 (Routes Design)

**專案名稱**：戀愛互動式故事網站
**日期**：2026-05-14

本文件依據 PRD、架構文件與資料庫設計，定義系統中所有的 URL 路由與頁面規劃。

## 1. 路由總覽表格

| 功能 | HTTP 方法 | URL 路徑 | 對應模板 | 說明 |
| :--- | :--- | :--- | :--- | :--- |
| **用戶系統 (Auth)** | | | | |
| 註冊頁面 | GET | `/register` | `auth/register.html` | 顯示註冊表單 |
| 建立帳號 | POST | `/register` | — | 接收註冊表單，寫入資料庫並導向登入頁 |
| 登入頁面 | GET | `/login` | `auth/login.html` | 顯示登入表單 |
| 驗證登入 | POST | `/login` | — | 驗證帳密，寫入 session，重導向首頁 |
| 登出 | GET | `/logout` | — | 清除 session，重導向登入頁 |
| **故事系統 (Story)** | | | | |
| 首頁 (主選單) | GET | `/` | `story/home.html` | 登入後的入口，包含開始/讀取/設定按鈕 |
| 閱讀故事節點 | GET | `/story/<node_id>` | `story/play.html` | 顯示劇情文本與選擇分支 |
| **存檔系統 (Save)** | | | | |
| 存檔清單 | GET | `/saves` | `save/list.html` | 顯示玩家所有存檔紀錄 |
| 新增存檔 | POST | `/saves/create`| — | 儲存當前 `node_id`，回傳成功訊息並重導向 |
| 讀取存檔 | POST | `/saves/<int:save_id>/load` | — | 根據存檔紀錄重導向至對應的故事節點 |
| 刪除存檔 | POST | `/saves/<int:save_id>/delete`| — | 刪除存檔，重導向回存檔清單 |
| **個人化與成就 (User)** | | | | |
| 設定頁面 | GET | `/settings` | `user/settings.html` | 顯示更改名稱、佈景主題表單 |
| 更新設定 | POST | `/settings/update` | — | 更新使用者設定並重導向設定頁 |
| 成就列表 | GET | `/achievements` | `user/achievements.html`| 顯示已解鎖的成就 |

## 2. 每個路由的詳細說明

### 2.1 用戶系統 (auth.py)
- **POST `/register`**
  - **輸入**：表單欄位 `username`, `password`
  - **處理邏輯**：呼叫 `User.create()`，密碼需雜湊加密。若帳號重複需報錯。
  - **輸出**：成功則 `redirect('/login')`，失敗則渲染 `register.html` 附帶錯誤訊息。

- **POST `/login`**
  - **輸入**：表單欄位 `username`, `password`
  - **處理邏輯**：呼叫 `User.get_by_username()` 驗證密碼，成功則 `session['user_id'] = user.id`。
  - **輸出**：成功則 `redirect('/')`，失敗則渲染 `login.html` 附帶錯誤。

### 2.2 故事系統 (story.py)
- **GET `/story/<node_id>`**
  - **輸入**：URL 參數 `node_id`
  - **處理邏輯**：根據 `node_id` 撈取劇情文本與選項（可從靜態 JSON 或 DB 讀取）。檢查 Session 確保已登入。同時檢查是否觸發隱藏成就。
  - **輸出**：渲染 `story/play.html`。若未登入則導向 `/login`。

### 2.3 存檔系統 (save.py)
- **POST `/saves/create`**
  - **輸入**：表單隱藏欄位 `node_id`
  - **處理邏輯**：呼叫 `Save.create(session['user_id'], node_id)` 寫入 DB。
  - **輸出**：重新導向回 `/story/<node_id>` 附帶「存檔成功」Flash 訊息。

### 2.4 個人化與成就 (user.py)
- **GET `/achievements`**
  - **處理邏輯**：呼叫 `Achievement.get_all_by_user(session['user_id'])` 取得解鎖紀錄。
  - **輸出**：渲染 `user/achievements.html`。

## 3. Jinja2 模板清單

所有模板皆繼承自 `base.html`，以保持外觀一致性：

- `templates/base.html` (包含 Navbar, Flash messages, 引入共通 CSS/JS)
- `templates/auth/login.html` (繼承 base.html)
- `templates/auth/register.html` (繼承 base.html)
- `templates/story/home.html` (繼承 base.html)
- `templates/story/play.html` (繼承 base.html)
- `templates/save/list.html` (繼承 base.html)
- `templates/user/settings.html` (繼承 base.html)
- `templates/user/achievements.html` (繼承 base.html)
