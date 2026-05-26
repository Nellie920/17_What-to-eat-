// Game State
const gameState = {
    currentStep: 'targetGender', 
    targetGender: null,
    targetCharacter: null,
    playerGender: null,
    resolvedTargetGender: null,
    resolvedTargetCharacter: null,
    resolvedPlayerGender: null,
    preferences: {
        npcColor: '#d6336c',
        playerColor: '#4facfe',
        textColor: '#ffffff',
        actionColor: '#b0b0b0'
    }
};

// Character Data
const charactersData = {
    male: [
        { id: 'A1', name: '洛頁彥', icon: '👦' },
        { id: 'A2', name: '齊勻楠', icon: '🧑' },
        { id: 'A3', name: '秦陌寂', icon: '👨' }
    ],
    female: [
        { id: 'B1', name: '田媛寧', icon: '👧' },
        { id: 'B2', name: '張栖鈴', icon: '👩' },
        { id: 'B3', name: '顧音棉', icon: '👱‍♀️' }
    ]
};

// Select Target Gender
function selectTargetGender(gender, event) {
    // 1. Update state
    gameState.targetGender = gender;
    console.log("選擇攻略對象性別:", gender);
    
    // 2. Visual feedback
    // Remove selected class from all buttons
    const buttons = document.querySelectorAll('#target-gender-selection .choice-btn');
    buttons.forEach(btn => {
        btn.classList.remove('selected');
        btn.style.pointerEvents = 'none'; // Prevent clicking while processing
    });
    
    // Add selected class to the clicked button
    const clickedBtn = event.currentTarget;
    clickedBtn.classList.add('selected');
    
    // 3. Transition to the next step
    setTimeout(() => {
        if (gender === 'random') {
            showPlayerGenderSelection();
        } else {
            showCharacterSelection(gender);
        }
    }, 600);
}

// Show Target Character Selection Screen
function showCharacterSelection(gender) {
    gameState.currentStep = 'targetCharacter';
    
    // Hide current screen
    document.getElementById('target-gender-selection').classList.remove('active');
    
    // Generate character cards
    const grid = document.getElementById('character-grid');
    grid.innerHTML = '';
    
    const chars = charactersData[gender];
    chars.forEach(char => {
        grid.appendChild(createCharacterCard(char));
    });
    
    // Add random option
    grid.appendChild(createCharacterCard({ id: 'random_char', name: '隨機', icon: '❓' }));
    
    // Show new screen
    setTimeout(() => {
        document.getElementById('target-character-selection').classList.add('active');
    }, 50);
}

// Create a character card element
function createCharacterCard(char) {
    const div = document.createElement('div');
    div.className = 'character-card';
    div.onclick = (e) => selectTargetCharacter(char.id, e);
    
    let infoHtml = '';
    if (char.id !== 'random_char') {
        // 放大鏡圖標，點擊查看人物介紹
        infoHtml = `<div class="info-icon" onclick="showCharacterInfo('${char.id}', event)">🔍</div>`;
    }
    
    div.innerHTML = `
        <div class="char-image-placeholder">
            ${char.icon}
            ${infoHtml}
            <div class="char-name-banner">${char.name}</div>
        </div>
    `;
    return div;
}

// Select a target character
function selectTargetCharacter(charId, event) {
    gameState.targetCharacter = charId;
    
    const cards = document.querySelectorAll('#target-character-selection .character-card');
    cards.forEach(card => {
        card.classList.remove('selected');
        card.style.pointerEvents = 'none';
    });
    
    event.currentTarget.classList.add('selected');
    
    setTimeout(() => {
        showPlayerGenderSelection();
    }, 600);
}

// Show character info
function showCharacterInfo(charId, event) {
    event.stopPropagation(); // 防止觸發卡片選擇
    alert(`【展示人物介紹】\n這裡將在後續階段實作詳細的 ${charId} 介紹彈窗！`);
}

// Show Player Gender Selection Screen
function showPlayerGenderSelection() {
    gameState.currentStep = 'playerGender';
    
    // Hide previous screens
    document.getElementById('target-gender-selection').classList.remove('active');
    document.getElementById('target-character-selection').classList.remove('active');
    
    // Show player gender screen
    setTimeout(() => {
        document.getElementById('player-gender-selection').classList.add('active');
    }, 50);
}

// Select Player Gender
function selectPlayerGender(gender, event) {
    gameState.playerGender = gender;
    
    const buttons = document.querySelectorAll('#player-gender-selection .choice-btn');
    buttons.forEach(btn => {
        btn.classList.remove('selected');
        btn.style.pointerEvents = 'none';
    });
    
    event.currentTarget.classList.add('selected');
    
    setTimeout(() => {
        resolveRandomSelections();
        showConfirmationScreen();
    }, 600);
}

// Resolve Random Selections
function resolveRandomSelections() {
    // 1. Resolve Target Gender
    if (gameState.targetGender === 'random') {
        const genders = ['male', 'female'];
        gameState.resolvedTargetGender = genders[Math.floor(Math.random() * genders.length)];
    } else {
        gameState.resolvedTargetGender = gameState.targetGender;
    }

    // 2. Resolve Target Character
    if (!gameState.targetCharacter || gameState.targetCharacter === 'random_char' || gameState.targetGender === 'random') {
        const chars = charactersData[gameState.resolvedTargetGender];
        const randomChar = chars[Math.floor(Math.random() * chars.length)];
        gameState.resolvedTargetCharacter = randomChar.id;
    } else {
        gameState.resolvedTargetCharacter = gameState.targetCharacter;
    }

    // 3. Resolve Player Gender
    if (gameState.playerGender === 'random') {
        const genders = ['male', 'female'];
        gameState.resolvedPlayerGender = genders[Math.floor(Math.random() * genders.length)];
    } else {
        gameState.resolvedPlayerGender = gameState.playerGender;
    }
}

// Show Confirmation Screen
function showConfirmationScreen() {
    gameState.currentStep = 'confirmation';
    
    // Hide previous screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    // Get resolved character data
    const targetGenderGroup = charactersData[gameState.resolvedTargetGender];
    const targetCharData = targetGenderGroup.find(c => c.id === gameState.resolvedTargetCharacter);
    
    // Populate Target Card
    const targetCardHtml = `
        <div class="char-image-placeholder">
            ${targetCharData.icon}
            <div class="info-icon" onclick="showCharacterInfo('${targetCharData.id}', event)">🔍</div>
            <div class="char-name-banner">${targetCharData.name}</div>
        </div>
    `;
    document.getElementById('confirm-target-card').innerHTML = targetCardHtml;
    
    // Populate Player Card
    const playerIcon = gameState.resolvedPlayerGender === 'male' ? '👦' : '👧';
    const playerText = gameState.resolvedPlayerGender === 'male' ? '男性化身' : '女性化身';
    const playerCardHtml = `
        <div class="char-image-placeholder">
            ${playerIcon}
            <div class="char-name-banner">${playerText}</div>
        </div>
    `;
    document.getElementById('confirm-player-card').innerHTML = playerCardHtml;
    
    // Show Screen
    setTimeout(() => {
        document.getElementById('confirmation-screen').classList.add('active');
    }, 50);
}

// Start Game (proceed to Phase 2)
function startGame() {
    gameState.currentStep = 'game';
    
    // 1. 自動載入該劇情(角色)的專屬顏色設定，若無則重置為預設
    const charPrefsStr = localStorage.getItem(`whispers_prefs_${gameState.resolvedTargetCharacter}`);
    if (charPrefsStr) {
        gameState.preferences = JSON.parse(charPrefsStr);
    } else {
        gameState.preferences = {
            npcColor: '#d6336c',
            playerColor: '#4facfe',
            textColor: '#ffffff',
            actionColor: '#b0b0b0'
        };
    }
    
    // 應用設定到畫面
    const p = gameState.preferences;
    document.documentElement.style.setProperty('--npc-dialogue-border', p.npcColor);
    document.documentElement.style.setProperty('--player-dialogue-border', p.playerColor);
    document.documentElement.style.setProperty('--dialogue-text-color', p.textColor);
    document.documentElement.style.setProperty('--action-text-color', p.actionColor);
    document.documentElement.style.setProperty('--npc-dialogue-bg', hexToRgba(p.npcColor, 0.1));
    document.documentElement.style.setProperty('--player-dialogue-bg', hexToRgba(p.playerColor, 0.1));
    
    // 2. Hide previous screens and back button
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('back-btn').style.display = 'none';
    
    // 渲染遊戲中的立繪卡片
    const targetCharData = charactersData[gameState.resolvedTargetGender].find(c => c.id === gameState.resolvedTargetCharacter);
    const charCardHtml = `
        <div class="char-image-placeholder">
            ${targetCharData.icon}
            <div class="info-icon" onclick="showCharacterInfo('${targetCharData.id}', event)">🔍</div>
            <div class="char-name-banner">${targetCharData.name}</div>
        </div>
    `;
    document.getElementById('game-character-card').innerHTML = charCardHtml;
    
    // Show game screen
    setTimeout(() => {
        document.getElementById('game-screen').classList.add('active');
        initScrollListener();
        scrollToBottom();
    }, 50);
}

// 初始化對話紀錄捲動監聽
function initScrollListener() {
    const historyPanel = document.getElementById('dialogue-history');
    const scrollBtn = document.getElementById('scroll-bottom-btn');
    if (historyPanel && scrollBtn) {
        historyPanel.onscroll = () => {
            // 距離底部大於 50px 則顯示按鈕
            if (historyPanel.scrollHeight - historyPanel.scrollTop - historyPanel.clientHeight > 50) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        };
    }
}

// 將對話紀錄捲至最底
function scrollToBottom() {
    const historyPanel = document.getElementById('dialogue-history');
    if (historyPanel) {
        historyPanel.scrollTo({
            top: historyPanel.scrollHeight,
            behavior: 'smooth'
        });
    }
}

// Show Exit Confirmation in Game Screen
function showExitConfirm() {
    const modal = document.getElementById('confirm-modal');
    modal.classList.add('active');
}

// Handle Back Button Click
function handleBack() {
    if (gameState.currentStep === 'targetGender') {
        // 目前在第一個畫面，詢問是否返回主頁面
        const modal = document.getElementById('confirm-modal');
        modal.classList.add('active');
    } else if (gameState.currentStep === 'targetCharacter') {
        // 從角色選擇返回性別選擇
        document.getElementById('target-character-selection').classList.remove('active');
        setTimeout(() => {
            document.getElementById('target-gender-selection').classList.add('active');
        }, 300);
        gameState.currentStep = 'targetGender';
        
        // 復原性別選擇按鈕狀態
        const buttons = document.querySelectorAll('#target-gender-selection .choice-btn');
        buttons.forEach(btn => {
            btn.classList.remove('selected');
            btn.style.pointerEvents = 'auto';
        });
    } else if (gameState.currentStep === 'playerGender') {
        // 從玩家性別選擇返回
        document.getElementById('player-gender-selection').classList.remove('active');
        
        setTimeout(() => {
            if (gameState.targetGender === 'random') {
                // 若前面選擇隨機性別，則返回性別選擇
                document.getElementById('target-gender-selection').classList.add('active');
                gameState.currentStep = 'targetGender';
                
                // 復原性別選擇的按鈕狀態
                const buttons = document.querySelectorAll('#target-gender-selection .choice-btn');
                buttons.forEach(btn => {
                    btn.classList.remove('selected');
                    btn.style.pointerEvents = 'auto';
                });
            } else {
                // 否則返回特定角色選擇
                document.getElementById('target-character-selection').classList.add('active');
                gameState.currentStep = 'targetCharacter';
                
                // 復原角色選擇的卡片狀態
                const cards = document.querySelectorAll('#target-character-selection .character-card');
                cards.forEach(card => {
                    card.classList.remove('selected');
                    card.style.pointerEvents = 'auto';
                });
            }
        }, 300);
    } else if (gameState.currentStep === 'confirmation') {
        // 從確認畫面返回玩家性別選擇
        document.getElementById('confirmation-screen').classList.remove('active');
        
        setTimeout(() => {
            document.getElementById('player-gender-selection').classList.add('active');
        }, 300);
        gameState.currentStep = 'playerGender';
        
        // 復原玩家性別選擇的按鈕狀態
        const buttons = document.querySelectorAll('#player-gender-selection .choice-btn');
        buttons.forEach(btn => {
            btn.classList.remove('selected');
            btn.style.pointerEvents = 'auto';
        });
    }
}

// Close Modal
function closeModal(event) {
    const modal = document.getElementById('confirm-modal');
    modal.classList.remove('active');
}

// Return to Main Menu
function returnToMainMenu() {
    alert('【模擬返回主頁面】\n將在此處切換回遊戲主選單畫面！');
    closeModal();
    // 實際遊戲中這裡會執行 window.location.href = 'main.html' 或進行畫面的卸載
}

// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('game-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (sidebar.classList.contains('collapsed')) {
        sidebar.classList.remove('collapsed');
        overlay.classList.add('active');
    } else {
        sidebar.classList.add('collapsed');
        overlay.classList.remove('active');
    }
}

// Settings Modal Logic
function getBrightness(hex) {
    if (!hex.startsWith('#') || hex.length !== 7) return 255;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // 使用標準亮度公式
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

function hexToRgba(hex, alpha) {
    if (hex.length !== 7) return `rgba(255, 255, 255, ${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function openSettingsModal() {
    const rootStyles = getComputedStyle(document.documentElement);
    let npcColor = rootStyles.getPropertyValue('--npc-dialogue-border').trim();
    let playerColor = rootStyles.getPropertyValue('--player-dialogue-border').trim();
    let textColor = rootStyles.getPropertyValue('--dialogue-text-color').trim();
    let actionColor = rootStyles.getPropertyValue('--action-text-color').trim();
    
    if (!npcColor.startsWith('#')) npcColor = '#d6336c';
    if (!playerColor.startsWith('#')) playerColor = '#4facfe';
    if (!textColor.startsWith('#')) textColor = '#ffffff';
    if (!actionColor.startsWith('#')) actionColor = '#b0b0b0';
    
    document.getElementById('npc-color-picker').value = npcColor;
    document.getElementById('player-color-picker').value = playerColor;
    document.getElementById('text-color-picker').value = textColor;
    document.getElementById('action-color-picker').value = actionColor;
    document.getElementById('settings-error').style.display = 'none';
    
    document.getElementById('settings-modal').classList.add('active');
}

function closeSettingsModal(event) {
    if (event) event.stopPropagation();
    document.getElementById('settings-modal').classList.remove('active');
}

function saveSettings() {
    const npcColor = document.getElementById('npc-color-picker').value;
    const playerColor = document.getElementById('player-color-picker').value;
    const textColor = document.getElementById('text-color-picker').value;
    const actionColor = document.getElementById('action-color-picker').value;
    const errorMsg = document.getElementById('settings-error');
    
    // 防呆機制：顏色不得相同
    if (npcColor.toLowerCase() === playerColor.toLowerCase()) {
        errorMsg.innerText = '防呆提示：雙方對話框顏色不得完全相同！';
        errorMsg.style.display = 'block';
        return; 
    }
    
    // 防呆機制：文字顏色必須比動作顏色更「深」(在這裡也就是亮度較高/白，因為是深色底)
    // 比較兩者的亮度，預期一般文字亮度 > 動作文字亮度
    if (getBrightness(textColor) <= getBrightness(actionColor)) {
        errorMsg.innerText = '防呆提示：一般文字顏色必須比動作文字更顯眼(亮度較高)！';
        errorMsg.style.display = 'block';
        return;
    }
    
    // 儲存設定至 gameState 
    gameState.preferences = {
        npcColor: npcColor,
        playerColor: playerColor,
        textColor: textColor,
        actionColor: actionColor
    };
    
    // 將顏色設定獨立綁定至「當前劇情(攻略對象)」，自動寫入 localStorage
    if (gameState.resolvedTargetCharacter) {
        localStorage.setItem(`whispers_prefs_${gameState.resolvedTargetCharacter}`, JSON.stringify(gameState.preferences));
    }
    
    // 儲存設定至 CSS 變數
    document.documentElement.style.setProperty('--npc-dialogue-border', npcColor);
    document.documentElement.style.setProperty('--player-dialogue-border', playerColor);
    document.documentElement.style.setProperty('--dialogue-text-color', textColor);
    document.documentElement.style.setProperty('--action-text-color', actionColor);
    
    // 動態產生對應且具有 10% 透明度的背景色
    document.documentElement.style.setProperty('--npc-dialogue-bg', hexToRgba(npcColor, 0.1));
    document.documentElement.style.setProperty('--player-dialogue-bg', hexToRgba(playerColor, 0.1));
    
    closeSettingsModal();
}

// 動態格式化對話文字 (未來 2-3 打字機使用)
function formatDialogueText(text) {
    return text.replace(/(\(.*?\)|（.*?）)/g, '<span class="action-text">$1</span>');
}

// ==================== 存檔與讀檔系統 ====================
let currentSaveLoadMode = 'save';
const MAX_SAVE_SLOTS = 3;

function openSaveLoadModal(mode) {
    currentSaveLoadMode = mode;
    document.getElementById('saveload-title').innerText = mode === 'save' ? '選擇存檔欄位' : '選擇讀檔欄位';
    
    const container = document.getElementById('saveload-slots-container');
    container.innerHTML = ''; // 清空舊選項
    
    for (let i = 1; i <= MAX_SAVE_SLOTS; i++) {
        const slotData = localStorage.getItem(`whispers_save_${i}`);
        const slotEl = document.createElement('div');
        
        if (slotData) {
            const data = JSON.parse(slotData);
            const dateStr = new Date(data.timestamp).toLocaleString();
            let targetName = '未知';
            if (data.resolvedTargetGender && data.resolvedTargetCharacter) {
                const charData = charactersData[data.resolvedTargetGender].find(c => c.id === data.resolvedTargetCharacter);
                if (charData) targetName = charData.name;
            }
            
            slotEl.className = 'save-slot';
            slotEl.innerHTML = `
                <div class="save-info-row">
                    <strong>Slot ${i} - 攻略對象: ${targetName}</strong>
                    <span class="save-date">${dateStr}</span>
                </div>
                <div style="font-size: 0.9rem; color: var(--text-dim);">
                    點擊以${mode === 'save' ? '覆蓋存檔' : '讀取進度'}
                </div>
            `;
        } else {
            slotEl.className = 'save-slot empty';
            slotEl.innerHTML = `<div>Slot ${i} - 空白欄位</div>`;
            if (mode === 'load') {
                slotEl.style.pointerEvents = 'none';
                slotEl.style.opacity = '0.3';
            }
        }
        
        slotEl.onclick = () => handleSaveLoadSlot(i);
        container.appendChild(slotEl);
    }
    
    document.getElementById('saveload-modal').classList.add('active');
}

function closeSaveLoadModal(event) {
    if (event) event.stopPropagation();
    document.getElementById('saveload-modal').classList.remove('active');
}

function handleSaveLoadSlot(slotId) {
    if (currentSaveLoadMode === 'save') {
        // 儲存目前的遊戲狀態與偏好設定
        const saveData = {
            ...gameState,
            timestamp: Date.now()
        };
        localStorage.setItem(`whispers_save_${slotId}`, JSON.stringify(saveData));
        alert(`已成功儲存進度與偏好設定至 Slot ${slotId}`);
        closeSaveLoadModal();
    } else {
        // 讀取進度與偏好設定
        const slotData = localStorage.getItem(`whispers_save_${slotId}`);
        if (slotData) {
            const parsedData = JSON.parse(slotData);
            Object.assign(gameState, parsedData);
            
            // 套用讀取到的專屬設定
            if (gameState.preferences) {
                const p = gameState.preferences;
                document.documentElement.style.setProperty('--npc-dialogue-border', p.npcColor);
                document.documentElement.style.setProperty('--player-dialogue-border', p.playerColor);
                document.documentElement.style.setProperty('--dialogue-text-color', p.textColor);
                document.documentElement.style.setProperty('--action-text-color', p.actionColor);
                
                document.documentElement.style.setProperty('--npc-dialogue-bg', hexToRgba(p.npcColor, 0.1));
                document.documentElement.style.setProperty('--player-dialogue-bg', hexToRgba(p.playerColor, 0.1));
            }
            
            alert(`已讀取 Slot ${slotId} 的進度與設定！`);
            closeSaveLoadModal();
            
            // 恢復遊戲畫面
            if (gameState.currentStep === 'game') {
                document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
                document.getElementById('game-screen').classList.add('active');
                
                // 重新渲染左側立繪卡片
                const targetCharData = charactersData[gameState.resolvedTargetGender].find(c => c.id === gameState.resolvedTargetCharacter);
                const charCardHtml = `
                    <div class="char-image-placeholder">
                        ${targetCharData.icon}
                        <div class="info-icon" onclick="showCharacterInfo('${targetCharData.id}', event)">🔍</div>
                        <div class="char-name-banner">${targetCharData.name}</div>
                    </div>
                `;
                document.getElementById('game-character-card').innerHTML = charCardHtml;
                
                // (如果已有實作對話紀錄重建，這裡也會一併處理)
                scrollToBottom();
            }
        }
    }
}

