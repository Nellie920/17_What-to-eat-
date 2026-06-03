# 戀愛互動式故事網站 - 多媒體與互動流程圖 (System Flowcharts)

| 專案名稱 | 戀愛互動式故事網站 | 組別 / 組號 | 等一下要吃什麼? / 17 |
| :--- | :--- | :--- | :--- |
| **文件名稱** | 多媒體與互動流程圖 (Multimedia Flowcharts) | **主要依據** | [PRD_Multimedia_Interaction.md](file:///c:/Users/user/OneDrive/%E6%A1%8C%E9%9D%A2/17_What-to-eat--1/docs/PRD_Multimedia_Interaction.md) & [System_Architecture.md](file:///c:/Users/user/OneDrive/%E6%A1%8C%E9%9D%A2/17_What-to-eat--1/docs/System_Architecture.md) |
| **文件版本** | V1.0 | **建立日期** | 2026-05-20 |
| **狀態** | 正式 (Finalized) | **適用範圍** | 前端開發、音訊管理與動效控制邏輯實作 |

---

## 1. 流程圖一：全域初始化與瀏覽器自動播放解鎖流程

本流程描述網頁首次載入時，多媒體互動模組如何偵測瀏覽器的 Autoplay 政策限制，並透過使用者互動解鎖音訊上下文，確保背景音樂（BGM）順利播放。

```mermaid
flowchart TD
    A([玩家打開遊戲網頁]) --> B[初始化 AudioManager 單例]
    B --> C[從 localStorage 讀取音量與靜音狀態]
    C --> D{瀏覽器是否允許自動播放?}
    
    D -- 是 (已授權過) --> E[直接播放預設背景音樂 intro_theme.mp3]
    D -- 否 (限制中) --> F[網頁保持靜音狀態]
    
    F --> G[故事引擎顯示「點擊進入故事」或「登入」首頁 UI]
    G --> H[玩家點擊「進入」按鈕]
    
    H --> I[觸發事件監聽器並調用 AudioManager.unlockAudio]
    I --> J[建立 HTML5 Web Audio Context]
    J --> K{AudioContext.state == 'suspended'? }
    
    K -- 是 --> L[執行 AudioContext.resume 進行解鎖]
    K -- 否 --> M[audioUnlocked 標記為 true]
    
    L --> M
    M --> N[呼叫 playBGM 播放初始音樂]
    N --> O([成功播放音樂, 進入故事主介面])
```

---

## 2. 流程圖二：核心劇本節點渲染與多媒體執行流程

當故事引擎（F-02）載入新劇本節點時，此流程控制多媒體互動模組（BGM 切換、特效渲染、打字機效果）與玩家互動的並行執行邏輯。

```mermaid
flowchart TD
    A([故事引擎載入新節點 JSON]) --> B[提取 background_image, dialogue, bgm, effects, choices 欄位]
    
    %% 併發處理
    B --> C1[視覺背景轉場]
    B --> C2[BGM 音訊切換]
    B --> C3[特殊效果與音效]
    B --> C4[對話框打字機效果]
    
    %% 背景轉場分流
    C1 --> D1[調用 InteractionEffects.applyCrossFade]
    D1 --> E1[新背景圖片 0.8s 淡入, 舊背景圖片淡出]
    
    %% BGM切換分流
    C2 --> D2{新 bgm 檔案與目前播放是否相同?}
    D2 -- 是 --> E2[維持現狀, 繼續播放]
    D2 -- 否 --> F2[調用 AudioManager.fadeTransition]
    F2 --> G2[舊音樂 1.2s 內漸漸淡出至 0]
    G2 --> H2[新音樂非同步載入後 1.2s 內淡入至設定音量]
    
    %% 特效與音效分流
    C3 --> D3{節點是否包含 effects ?}
    D3 -- 否 --> E3[不執行任何特效與情境音效]
    D3 -- 是 --> F3[遍歷 effects 陣列並依 delay 時間延遲執行]
    F3 --> G3{特效類型?}
    G3 -- "shake" --> H3_1[InteractionEffects.triggerShake: 容器隨機震動 0.5s]
    G3 -- "flash" --> H3_2[InteractionEffects.triggerFlash: 全螢幕疊加色閃爍 0.4s]
    G3 -- "sfx" --> H3_3[AudioManager.playSFX: 播放敲門/心跳等情境音效]
    
    %% 打字機分流
    C4 --> D4[調用 InteractionEffects.typewriter 啟動 40ms/字 動畫]
    D4 --> E4{玩家是否在文字播放期間點擊對話框?}
    E4 -- 是 (點擊 Skip) --> F4[呼叫 InteractionEffects.skipTypewriter]
    F4 --> G4[清除打字 interval, 瞬間顯示完整文本]
    E4 -- 否 (播放完畢) --> H4[顯示完整文本, 清除 dataset 標記]
    
    %% 匯總至選擇肢與等待
    E1 --> I[等待畫面與對話框渲染完成]
    E2 --> I
    H2 --> I
    H3_1 --> I
    H3_2 --> I
    H3_3 --> I
    G4 --> I
    H4 --> I
    
    I --> J[渲染劇情選擇肢 Choice Buttons]
    J --> K[為按鈕綁定 Hover 音效與 CSS 浮動/發光樣式]
    K --> L[等待玩家點擊選擇肢]
    
    L --> M([玩家點擊: 播放 click 音效, 進展至下一個節點])
```

---

## 3. 流程圖三：音訊避讓 (Audio Ducking) 控制流程

當觸發重要劇情音效（如巨大的敲門聲、爆炸聲、受傷心跳聲）時，系統會自動調降 BGM 音量以避免雜音干擾並強化氛圍，音效播放完畢後再恢復 BGM 音量。

```mermaid
flowchart TD
    A([故事引擎呼叫 AudioManager.playSFX]) --> B[建立新 SFX Audio 物件]
    B --> C{是否開啟靜音或是目前 BGM 暫停中?}
    
    C -- 是 --> D[將 SFX 音量設為 0 / 直接靜音播放]
    C -- 否 --> E[將 SFX 音量設為目前 sfxVolume 設定值]
    
    E --> F{此音效是否為單次劇情音效且支援 Ducking?}
    F -- 否 --> G[直接播放 SFX, BGM 音量維持原設定]
    
    F -- 是 --> H[計算 BGM 避讓目標音量: bgmVolume * 30%]
    H --> I[執行 fadeVolume 將 BGM 於 0.2 秒內降至目標音量]
    I --> J[正常音量播放劇情 SFX]
    
    J --> K[啟動計時器 / 等待音效播放結束]
    K --> L[執行 fadeVolume 將 BGM 於 0.5 秒內漸變升回原設定音量]
    
    D --> M([音效播放流程結束])
    G --> M
    L --> M
```

---

## 4. 流程圖四：存讀檔多媒體狀態同步流程

當玩家執行存檔（Save）或讀檔（Load）時，前後端資料庫與多媒體控制器的同步處理流程。

```mermaid
flowchart TD
    subgraph SAVE_FLOW [存檔流程]
        S1([玩家點擊存檔]) --> S2[取得當前故事引擎節點 node_id]
        S2 --> S3[讀取 AudioManager 全域狀態]
        S3 --> S4[封裝 multimedia_state:<br/>BGM 路徑、播放進度 currentTime、音量值、靜音狀態]
        S4 --> S5[透過 Fetch POST 傳送 JSON 資料至 Flask 後端]
        S5 --> S6[Flask 執行 SQL 將多媒體與存檔狀態寫入 SQLite]
        S6 --> S7([顯示「存檔成功」提示])
    end

    subgraph LOAD_FLOW [讀檔流程]
        L1([玩家點擊讀檔]) --> L2[選擇存檔點, 發送 GET 請求]
        L2 --> L3[Flask 從 SQLite 讀取 JSON 並回傳前端]
        L3 --> L4[故事引擎 F-02 還原當前劇情節點場景]
        L4 --> L5[讀取 JSON 中的 multimedia_state]
        
        L5 --> L6[設定音量滑桿數值與靜音狀態至 AudioManager]
        L6 --> L7{存檔中的 BGM 與目前播放是否相同?}
        
        L7 -- 否 --> L8[調用 playBGM 載入新背景音樂]
        L7 -- 是 --> L9[繼續播放現有背景音樂]
        
        L8 --> L10[將背景音樂播放進度設為 saved currentTime]
        L9 --> L10
        L10 --> L11([恢復打字機文字顯示，玩家繼續遊玩])
    end
```

---

*備註：以上流程圖明確規定了多媒體管理（F-06）在執行時的條件分支、計時器延遲與資料庫交互時機，開發人員（吳禎晏）需依此邏輯編寫 JavaScript 邏輯結構，以符合專案架構規範。*
