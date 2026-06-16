/**
 * ==========================================================================
 * 戀愛互動式故事網站 - 前端主要控制器 (Orchestrator app.js)
 * 串接林永涵的 F-02 故事引擎、陳姵羽的 F-03 存讀檔、廖奕臻的 F-04 外觀、
 * 邱柏傑的 F-05 成就系統與吳禎晏的 F-06 多媒體互動模組。
 * ==========================================================================
 */

import AudioManager from './audio_manager.js';
import InteractionEffects from './effects.js';

// 初始化全域實例
const audio = AudioManager.getInstance();
let currentUser = null;
let currentCustomName = "主角";
let currentTheme = "default-pink";
let currentNodeId = "start";

// 劇本離線緩存，用於預載及本機展示
const offlineScript = {
  "start": {
    "node_id": "start",
    "background_image": "/static/images/bg/lobby.jpg",
    "speaker": "系統廣播",
    "dialogue": "歡迎來到《等一下要吃什麼？》互動故事網站！櫻花正在盛開，微風吹過髮梢，你正站在抉擇的十字路口...等一下，你想要和誰見面呢？",
    "bgm": "/static/audio/bgm/sweet_intro.wav",
    "effects": [],
    "choices": [
      {
        "text": "🌸 前往櫻花大道的學長 (心跳加速)",
        "next_node": "scene_cherry_01",
        "sfx_on_hover": "/static/audio/sfx/bubble_hover.wav",
        "sfx_on_click": "/static/audio/sfx/select_confirm.wav"
      },
      {
        "text": "☕ 去街角咖啡廳的青梅竹馬 (溫柔午後)",
        "next_node": "scene_cafe_01",
        "sfx_on_hover": "/static/audio/sfx/bubble_hover.wav",
        "sfx_on_click": "/static/audio/sfx/select_confirm.wav"
      }
    ]
  },
  "scene_cherry_01": {
    "node_id": "scene_cherry_01",
    "background_image": "/static/images/bg/park.jpg",
    "speaker": "帥氣學長",
    "dialogue": "（突然轉過身）啊！是你呀...我正好也在想你。那個...等一下要不要一起去吃晚餐？我訂了你最愛吃的那家日式料理。",
    "bgm": "/static/audio/bgm/romantic_piano.wav",
    "effects": [
      { "type": "flash", "color": "rgba(255,182,193,0.35)", "delay": 200 },
      { "type": "sfx", "src": "/static/audio/sfx/wind_bell.wav", "delay": 300 }
    ],
    "choices": [
      {
        "text": "好啊！我剛好也肚子超餓！(Happy End 線)",
        "next_node": "scene_happy_end",
        "sfx_on_hover": "/static/audio/sfx/bubble_hover.wav",
        "sfx_on_click": "/static/audio/sfx/select_confirm.wav"
      },
      {
        "text": "對不起，我今天晚上要減肥... (虐心 Sad End 線)",
        "next_node": "scene_sad_end",
        "sfx_on_hover": "/static/audio/sfx/bubble_hover.wav",
        "sfx_on_click": "/static/audio/sfx/sad_chord.wav"
      }
    ]
  },
  "scene_cafe_01": {
    "node_id": "scene_cafe_01",
    "background_image": "/static/images/bg/cafe.jpg",
    "speaker": "青梅竹馬",
    "dialogue": "笨蛋！你遲到了啦！我都幫你點好最愛的焦糖瑪奇朵了。喂，等一下吃完甜點，要不要陪我去河濱步道走走？",
    "bgm": "/static/audio/bgm/sweet_intro.wav",
    "effects": [
      { "type": "sfx", "src": "/static/audio/sfx/bubble_hover.wav", "delay": 200 }
    ],
    "choices": [
      {
        "text": "好啦，看在咖啡的份上就陪你吧！",
        "next_node": "scene_happy_end",
        "sfx_on_hover": "/static/audio/sfx/bubble_hover.wav",
        "sfx_on_click": "/static/audio/sfx/select_confirm.wav"
      }
    ]
  },
  "scene_happy_end": {
    "node_id": "scene_happy_end",
    "background_image": "/static/images/bg/dinner.jpg",
    "speaker": "故事結局",
    "dialogue": "你們並肩走在霓虹閃爍的街頭，笑聲延續在溫暖的空氣中。這就是心動的味道吧！【解鎖成就：戀愛大師】",
    "bgm": "/static/audio/bgm/sweet_intro.wav",
    "effects": [
      { "type": "flash", "color": "rgba(241,196,15,0.3)", "delay": 200 },
      { "type": "sfx", "src": "/static/audio/sfx/happy_trumpet.wav", "delay": 300 }
    ],
    "choices": [
      {
        "text": "🌸 重新開始心動旅程",
        "next_node": "start",
        "sfx_on_hover": "/static/audio/sfx/bubble_hover.wav",
        "sfx_on_click": "/static/audio/sfx/select_confirm.wav"
      }
    ],
    "auto_unlock_achievement_id": 2 // 戀愛大師
  },
  "scene_sad_end": {
    "node_id": "scene_sad_end",
    "background_image": "/static/images/bg/rain.jpg",
    "speaker": "故事結局",
    "dialogue": "冷風吹過，學長失落的背影漸漸消失在街角。天空中突然下起了細雨，你的心中泛起淡淡的懊悔...【解鎖成就：遺憾的美好】",
    "bgm": "/static/audio/bgm/tension_loop.wav",
    "effects": [
      { "type": "shake", "target": "#game-container", "delay": 100 },
      { "type": "sfx", "src": "/static/audio/sfx/sad_chord.wav", "delay": 200 }
    ],
    "choices": [
      {
        "text": "💔 重新開始重寫遺憾",
        "next_node": "start",
        "sfx_on_hover": "/static/audio/sfx/bubble_hover.wav",
        "sfx_on_click": "/static/audio/sfx/select_confirm.wav"
      }
    ],
    "auto_unlock_achievement_id": 3 // 遺憾的美好
  }
};

// ==========================================
// 1. DOM 節點初始化與事件監聽
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  setupGlobalAudioInteractions();
  setupAudioHUD();
  setupLobbyAndCoreEvents();
  setupAuthEvents();
  setupSaveEvents();
  setupAchievementEvents();
  setupProfileEvents();
  
  // 檢測當前 Session 登入狀態
  checkUserSession();
});

/**
 * 全域互動解鎖 BGM 與按鈕懸停/點擊音效代理
 */
function setupGlobalAudioInteractions() {
  // 1. 一次性互動解鎖並播放/還原背景音樂
  const startBGMOnInteraction = () => {
    audio.unlockAudio();
    // 優先使用 localStorage 中記錄的 BGM，若無則播放預設甜美大廳主題
    const savedBgm = localStorage.getItem('currentBgmSrc') || '/static/audio/bgm/sweet_intro.wav';
    audio.playBGM(savedBgm);
    
    // 移出事件以防重複解鎖
    document.removeEventListener('click', startBGMOnInteraction);
    document.removeEventListener('keydown', startBGMOnInteraction);
  };
  
  document.addEventListener('click', startBGMOnInteraction);
  document.addEventListener('keydown', startBGMOnInteraction);

  // 2. 按鈕/連結懸停與點擊音效事件代理
  const clickableSelectors = 'button, a, .choice-button, .btn, .nav-item, .theme-palette-btn, .hud-text-btn, .hud-icon-btn, .btn-glass, .option-btn, [role="button"]';
  
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest(clickableSelectors);
    if (target) {
      // 若該按鈕已有自訂 hover 音效（例如故事分支按鈕），則由局部代碼處理，全域直接跳過
      if (target.classList.contains('choice-button')) return;
      
      // 防止游標在按鈕內部子節點移動時重複觸發
      if (e.relatedTarget && target.contains(e.relatedTarget)) return;
      
      audio.playSFX('/static/audio/sfx/bubble_hover.wav');
    }
  });

  document.addEventListener('click', (e) => {
    const target = e.target.closest(clickableSelectors);
    if (target) {
      // 由於分支選項選擇按鈕 .choice-button 有呼叫 e.stopPropagation()，此處全域 Click 不會重複觸發
      audio.playSFX('/static/audio/sfx/select_confirm.wav');
    }
  });
}

// ==========================================
// 2. 音訊 HUD 控制器初始化 (F-06)
// ==========================================
function setupAudioHUD() {
  const btnMute = document.getElementById('btn-mute');
  const sliderBGM = document.getElementById('slider-bgm');
  const sliderSFX = document.getElementById('slider-sfx');

  // 設定滑桿初始數值 (防空判定)
  if (sliderBGM) sliderBGM.value = audio.bgmVolume;
  if (sliderSFX) sliderSFX.value = audio.sfxVolume;
  updateMuteIcon(btnMute);

  // 監聽一鍵靜音
  btnMute?.addEventListener('click', () => {
    const isMuted = audio.toggleMute();
    updateMuteIcon(btnMute);
    // 觸發音律沉浸者成就
    unlockAchievementApi(4); 
  });

  // 監聽音量調節
  sliderBGM?.addEventListener('input', (e) => {
    audio.setBGMVolume(parseFloat(e.target.value));
  });

  sliderSFX?.addEventListener('input', (e) => {
    audio.setSFXVolume(parseFloat(e.target.value));
  });

  // 音量變更結束時判定解鎖成就
  sliderBGM?.addEventListener('change', () => unlockAchievementApi(4));
  sliderSFX?.addEventListener('change', () => unlockAchievementApi(4));
}

function updateMuteIcon(btn) {
  if (!btn) return;
  const icon = btn.querySelector('i');
  if (audio.isMuted) {
    icon.className = 'fa-solid fa-volume-xmark text-pink';
  } else {
    icon.className = 'fa-solid fa-volume-high';
  }
}

// ==========================================
// 3. 大廳解鎖與核心對話渲染 (F-02/06)
// ==========================================
function setupLobbyAndCoreEvents() {
  const btnStart = document.getElementById('btn-start-game');
  const lobbyScreen = document.getElementById('lobby-screen');
  const dialogueBox = document.getElementById('dialogue-box');
  const dialogueText = document.getElementById('dialogue-text');

  // 點擊解鎖 Web Audio 並進入遊戲
  btnStart?.addEventListener('click', () => {
    audio.unlockAudio(); // 啟動 AudioContext
    lobbyScreen.classList.remove('active');
    
    // 播放初始音樂並渲染第一節點
    loadScriptNode(currentNodeId);
    
    // 自動解鎖 踏出第一步 成就
    unlockAchievementApi(1);
  });

  // 點擊對話框快速跳過打字機 (Skip Mechanism)
  dialogueBox?.addEventListener('click', () => {
    InteractionEffects.skipTypewriter(dialogueText);
  });
}

/**
 * 核心故事引擎：載入並渲染劇本節點
 */
function loadScriptNode(nodeId) {
  currentNodeId = nodeId;
  const dialogueText = document.getElementById('dialogue-text');
  const speakerLabel = document.getElementById('speaker-label');
  const sceneBg = document.getElementById('scene-bg');
  const choicesContainer = document.getElementById('choices-container');

  // 優先嘗試向 Flask REST API 發送請求，失敗則回退至離線劇本 (保證 100% 運行)
  fetch(`/api/story/nodes/${nodeId}`)
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(data => renderNode(data.node))
    .catch(() => {
      // 離線回退機制
      const offlineNode = offlineScript[nodeId];
      if (offlineNode) {
        renderNode(offlineNode);
      } else {
        console.error("無法加載劇本節點：", nodeId);
      }
    });

  function renderNode(node) {
    // 結局處理：隱藏 HUD 導航列，避免玩家點擊存讀檔、成就或帳號選單導致結局畫面消失
    const hudHeader = document.querySelector('.hud-header');
    if (hudHeader) {
      if (node.node_id === 'eval_ending' || node.node_id === 'scene_happy_end' || node.node_id === 'scene_sad_end') {
        hudHeader.style.display = 'none';
      } else {
        hudHeader.style.display = 'flex';
      }
    }

    // 1. 視覺背景 Cross-fade
    InteractionEffects.applyCrossFade(sceneBg, node.background_image);

    // 2. 背景音樂 (BGM) 自動淡入淡出切換
    if (node.bgm) {
      audio.playBGM(node.bgm);
    }

    // 3. 遍歷執行特殊效果 (震動、閃爍、情境音效)
    if (node.effects && node.effects.length > 0) {
      node.effects.forEach(eff => {
        setTimeout(() => {
          if (eff.type === 'shake') {
            const target = document.querySelector(eff.target) || document.body;
            InteractionEffects.triggerShake(target);
          } else if (eff.type === 'flash') {
            InteractionEffects.triggerFlash(eff.color);
          } else if (eff.type === 'sfx') {
            audio.playSFX(eff.src);
          }
        }, eff.delay || 0);
      });
    }

    // 4. 對話框逐字顯示打字機效果
    speakerLabel.textContent = node.speaker;
    InteractionEffects.typewriter(dialogueText, node.dialogue, 45);

    // 5. 渲染分支選擇肢
    choicesContainer.innerHTML = "";
    if (node.choices && node.choices.length > 0) {
      node.choices.forEach(ch => {
        const btn = document.createElement('button');
        btn.className = 'choice-button';
        btn.textContent = ch.text;
        
        // 綁定 Hover 與 Click 音效
        btn.addEventListener('mouseenter', () => {
          if (ch.sfx_on_hover) audio.playSFX(ch.sfx_on_hover);
        });
        
        btn.addEventListener('click', (e) => {
          e.stopPropagation(); // 阻止氣泡傳播，防範對話框 Skip 重疊
          if (ch.sfx_on_click) audio.playSFX(ch.sfx_on_click);
          
          // 載入下一節點
          loadScriptNode(ch.next_node);
        });

        choicesContainer.appendChild(btn);
      });
    }

    // 6. 判定自動成就解鎖 (F-05)
    if (node.auto_unlock_achievement_id) {
      unlockAchievementApi(node.auto_unlock_achievement_id);
    }
  }
}

// ==========================================
// 4. 用戶認證控制 (F-01)
// ==========================================
function setupAuthEvents() {
  const linkShowAuth = document.getElementById('link-show-auth');
  const authModal = document.getElementById('auth-modal');
  const btnCloseAuth = document.getElementById('btn-close-auth');
  const linkGoRegister = document.getElementById('link-go-register');
  const linkGoLogin = document.getElementById('link-go-login');
  
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');

  // 開關視窗
  linkShowAuth?.addEventListener('click', (e) => {
    e.preventDefault();
    authModal.classList.add('active');
  });

  btnCloseAuth?.addEventListener('click', () => {
    authModal.classList.remove('active');
  });

  // 表單切換
  linkGoRegister?.addEventListener('click', (e) => {
    e.preventDefault();
    formLogin.classList.remove('active');
    formRegister.classList.add('active');
    document.getElementById('auth-title').textContent = "免費註冊戀愛故事帳號";
  });

  linkGoLogin?.addEventListener('click', (e) => {
    e.preventDefault();
    formRegister.classList.remove('active');
    formLogin.classList.add('active');
    document.getElementById('auth-title').textContent = "登入戀愛故事帳號";
  });

  // 登入送出
  formLogin?.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        currentUser = data.user;
        updateUserUI();
        authModal.classList.remove('active');
        audio.playSFX('/static/audio/sfx/select_confirm.wav');
      } else {
        alert("登入失敗：" + data.message);
      }
    });
  });

  // 註冊送出
  formRegister?.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        alert("註冊成功！系統將自動登入。");
        // 自動登入
        currentUser = data.user;
        updateUserUI();
        authModal.classList.remove('active');
      } else {
        alert("註冊失敗：" + data.message);
      }
    });
  });
}

function checkUserSession() {
  fetch('/api/auth/session')
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(data => {
      if (data.status === 'success') {
        currentUser = data.user;
        updateUserUI();
      }
    })
    .catch(() => console.log("當前為訪客模式遊玩。"));
}

function updateUserUI() {
  const lobbyStatus = document.getElementById('lobby-user-status');
  const hudUserName = document.getElementById('hud-player-name');
  const greeting = document.getElementById('txt-user-greeting');
  
  if (currentUser) {
    if (lobbyStatus) lobbyStatus.textContent = `玩家：${currentUser.username}`;
    if (hudUserName) hudUserName.textContent = currentCustomName;
    if (greeting) greeting.textContent = `您好，${currentUser.username}！`;
  } else {
    if (lobbyStatus) lobbyStatus.textContent = "訪客模式";
    if (hudUserName) hudUserName.textContent = currentCustomName;
    if (greeting) greeting.textContent = "您好，訪客！";
  }
}

// ==========================================
// 5. 存讀檔邏輯控制 (F-03)
// ==========================================
function setupSaveEvents() {
  const btnShowSaves = document.getElementById('btn-show-saves');
  const savesDrawer = document.getElementById('saves-drawer');
  const btnCloseSaves = document.getElementById('btn-close-saves');
  const btnTriggerSave = document.getElementById('btn-trigger-save');
  const inputSaveName = document.getElementById('input-save-name');

  btnShowSaves?.addEventListener('click', () => {
    if (!currentUser) {
      alert("請先登入帳號後再進行存檔/讀檔操作。");
      document.getElementById('auth-modal').classList.add('active');
      return;
    }
    savesDrawer.classList.add('active');
    loadSavesList();
  });

  btnCloseSaves?.addEventListener('click', () => {
    savesDrawer.classList.remove('active');
  });

  // 新增存檔
  btnTriggerSave?.addEventListener('click', () => {
    const saveName = inputSaveName.value.trim();
    if (!saveName) {
      alert("請輸入存檔備註名稱。");
      return;
    }

    // 封裝包含多媒體播放與外觀設定的完整狀態
    const payload = {
      save_name: saveName,
      current_node: currentNodeId,
      custom_player_name: currentCustomName,
      ui_theme: currentTheme,
      bgm_src: audio.currentBGM ? audio.currentBGM.src.substring(audio.currentBGM.src.indexOf('/static')) : null,
      bgm_position: audio.currentBGM ? audio.currentBGM.currentTime : 0.0,
      bgm_volume: audio.bgmVolume,
      sfx_volume: audio.sfxVolume,
      is_muted: audio.isMuted
    };

    fetch('/api/saves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        alert("進度與多媒體狀態已成功寫入記憶存檔點！");
        inputSaveName.value = "";
        loadSavesList(); // 重新整理
      } else {
        alert("存檔失敗：" + data.message);
      }
    });
  });
}

function loadSavesList() {
  const listContainer = document.getElementById('saves-list');
  listContainer.innerHTML = `<div class="empty-state"><i class="fa-solid fa-spinner fa-spin"></i><p>載入檔案中...</p></div>`;

  fetch('/api/saves')
    .then(res => res.json())
    .then(data => {
      listContainer.innerHTML = "";
      if (data.status === 'success' && data.saves.length > 0) {
        data.saves.forEach(sv => {
          const card = document.createElement('div');
          card.className = 'save-card';
          
          const timeFormatted = new Date(sv.created_at).toLocaleString();
          card.innerHTML = `
            <div class="save-info">
              <h4>${sv.save_name}</h4>
              <p><i class="fa-solid fa-clock"></i> 儲存時間: ${timeFormatted}</p>
              <div class="save-meta">
                <span>角色: ${sv.custom_player_name}</span>
                <span>主題: ${sv.ui_theme}</span>
              </div>
            </div>
            <div class="save-actions">
              <button class="btn-save-load" data-id="${sv.id}"><i class="fa-solid fa-folder-open"></i> 讀檔</button>
              <button class="btn-save-del" data-id="${sv.id}"><i class="fa-solid fa-trash-can"></i> 刪除</button>
            </div>
          `;
          
          // 綁定讀取存檔
          card.querySelector('.btn-save-load').addEventListener('click', () => loadGameSaveApi(sv.id));
          // 綁定刪除存檔
          card.querySelector('.btn-save-del').addEventListener('click', () => deleteGameSaveApi(sv.id));

          listContainer.appendChild(card);
        });
      } else {
        listContainer.innerHTML = `<div class="empty-state"><i class="fa-solid fa-folder-open"></i><p>尚無任何記憶存檔點</p></div>`;
      }
    });
}

function loadGameSaveApi(saveId) {
  fetch(`/api/saves/${saveId}`)
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        const sv = data.save;
        alert(`已載入存檔進度：【${sv.save_name}】`);
        
        // 1. 還原外觀與角色暱稱
        currentCustomName = sv.custom_player_name;
        currentTheme = sv.ui_theme;
        updateUserUI();
        document.body.className = `theme-${currentTheme}`;
        
        // 還原個人化設定視窗內的選擇狀態
        document.getElementById('input-custom-name').value = currentCustomName;
        document.querySelectorAll('.theme-palette-btn').forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-theme') === currentTheme);
        });

        // 2. 還原多媒體與音量設定 (F-06)
        const ms = sv.multimedia_state;
        audio.bgmVolume = ms.bgm_volume;
        audio.sfxVolume = ms.sfx_volume;
        audio.isMuted = ms.is_muted;
        
        // 更新 UI 控制器
        document.getElementById('slider-bgm').value = audio.bgmVolume;
        document.getElementById('slider-sfx').value = audio.sfxVolume;
        updateMuteIcon(document.getElementById('btn-mute'));

        // 3. 還原背景音樂路徑與播放秒數進度
        if (ms.bgm_src) {
          audio.playBGM(ms.bgm_src);
          // 延遲以等待音軌載入完畢後，還原播放點
          setTimeout(() => {
            if (audio.currentBGM) {
              audio.currentBGM.currentTime = ms.bgm_position;
            }
          }, 500);
        }

        // 4. 重繪故事引擎場景
        loadScriptNode(sv.current_node);

        // 關閉抽屜
        document.getElementById('saves-drawer').classList.remove('active');
        audio.playSFX('/static/audio/sfx/select_confirm.wav');
      }
    });
}

function deleteGameSaveApi(saveId) {
  if (!confirm("確定要刪除這筆記憶存檔嗎？此動作無法復原。")) return;

  fetch(`/api/saves/${saveId}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        loadSavesList();
      } else {
        alert("刪除失敗：" + data.message);
      }
    });
}

// ==========================================
// 6. 成就系統牆邏輯 (F-05)
// ==========================================
function setupAchievementEvents() {
  const btnShowAc = document.getElementById('btn-show-achievements');
  const acDrawer = document.getElementById('achievements-drawer');
  const btnCloseAc = document.getElementById('btn-close-achievements');

  btnShowAc?.addEventListener('click', () => {
    if (!currentUser) {
      alert("請先登入帳號以開始解鎖並記錄您的小心動成就！");
      document.getElementById('auth-modal').classList.add('active');
      return;
    }
    acDrawer.classList.add('active');
    loadAchievementsList();
  });

  btnCloseAc?.addEventListener('click', () => {
    acDrawer.classList.remove('active');
  });
}

function loadAchievementsList() {
  const listContainer = document.getElementById('achievements-list');
  const totalPointsHud = document.getElementById('txt-total-points');
  listContainer.innerHTML = `<div class="empty-state"><i class="fa-solid fa-spinner fa-spin"></i><p>成就加載中...</p></div>`;

  fetch('/api/achievements')
    .then(res => res.json())
    .then(data => {
      listContainer.innerHTML = "";
      if (data.status === 'success') {
        let totalPoints = 0;
        data.achievements.forEach(ac => {
          const card = document.createElement('div');
          card.className = `achievement-card ${ac.unlocked ? 'unlocked' : ''}`;
          
          const icon = ac.unlocked ? '🏆' : '🔒';
          const timeFormatted = ac.unlocked_at 
                                ? new Date(ac.unlocked_at).toLocaleString() 
                                : '未解鎖';

          card.innerHTML = `
            <div class="achievement-icon">${icon}</div>
            <div class="achievement-details">
              <h4>${ac.title} <span class="text-gold">(+${ac.points}分)</span></h4>
              <p>${ac.description}</p>
              ${ac.unlocked ? `<div class="unlock-time"><i class="fa-solid fa-circle-check text-gold"></i> 解鎖於: ${timeFormatted}</div>` : ''}
            </div>
          `;

          if (ac.unlocked) {
            totalPoints += ac.points;
          }
          listContainer.appendChild(card);
        });

        totalPointsHud.textContent = totalPoints;
      }
    });
}

function unlockAchievementApi(achievementId) {
  if (!currentUser) return; // 訪客模式不解鎖
  
  fetch('/api/achievements/unlock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ achievement_id: achievementId })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 'success' && !data.already_unlocked) {
      // 觸發畫面上發光金色閃爍特效，並播放特殊成就音效
      InteractionEffects.triggerFlash('rgba(241, 196, 15, 0.45)');
      audio.playSFX('/static/audio/sfx/happy_trumpet.wav');
      alert(`🎉 恭喜達成成就：【${data.achievement.title}】！已獲得 ${data.achievement.points} 積分！`);
    }
    
    // 如果解鎖的是戀愛大師(2)或遺憾的美好(3)，自動也解鎖達成初次結局(6)
    if ((achievementId === 2 || achievementId === 3) && data.status === 'success') {
      unlockAchievementApi(6);
    }
  });
}

// ==========================================
// 7. 個人設定與主題配色 (F-04)
// ==========================================
function setupProfileEvents() {
  const btnShowProfile = document.getElementById('btn-hud-user');
  const profileModal = document.getElementById('profile-modal');
  const btnCloseProfile = document.getElementById('btn-close-profile');
  
  const btnSaveProfile = document.getElementById('btn-save-profile');
  const btnLogout = document.getElementById('btn-logout');
  const inputCustomName = document.getElementById('input-custom-name');
  
  // 開關
  btnShowProfile?.addEventListener('click', () => {
    profileModal.classList.add('active');
  });

  btnCloseProfile?.addEventListener('click', () => {
    profileModal.classList.remove('active');
  });

  // 主題切換點擊
  document.querySelectorAll('.theme-palette-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.theme-palette-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const selectTheme = btn.getAttribute('data-theme');
      // 即時切換主 body class 預覽
      document.body.className = `theme-${selectTheme}`;
    });
  });

  // 保存設定
  btnSaveProfile?.addEventListener('click', () => {
    const customName = inputCustomName.value.trim();
    const activeThemeBtn = document.querySelector('.theme-palette-btn.active');
    
    if (!customName) {
      alert("主角暱稱不可為空。");
      return;
    }

    currentCustomName = customName;
    if (activeThemeBtn) {
      currentTheme = activeThemeBtn.getAttribute('data-theme');
    }

    updateUserUI();
    document.body.className = `theme-${currentTheme}`;
    profileModal.classList.remove('active');
    
    audio.playSFX('/static/audio/sfx/select_confirm.wav');
    alert("主角個人化設定保存成功！");
    
    // 觸發百變主角成就
    unlockAchievementApi(5);
  });

  // 登出
  btnLogout?.addEventListener('click', () => {
    fetch('/api/auth/logout', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          currentUser = null;
          updateUserUI();
          profileModal.classList.remove('active');
          alert("您已安全登出系統。");
          // 重新載入 start 節點以防跨帳號進度問題
          loadScriptNode("start");
        }
      });
  });
}
