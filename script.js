// Game State
const gameState = {
    currentStep: 'targetGender', // 'targetGender', 'targetCharacter', 'playerGender'
    targetGender: null,
    targetCharacter: null,
    playerGender: null
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
    const buttons = document.querySelectorAll('.choice-btn');
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
    
    const cards = document.querySelectorAll('.character-card');
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
        let targetText = gameState.targetGender === 'male' ? '男性' : (gameState.targetGender === 'female' ? '女性' : '隨機');
        let charText = gameState.targetCharacter || (gameState.targetGender === 'random' ? '隨機' : '未選擇');
        let playerText = gender === 'male' ? '男性' : (gender === 'female' ? '女性' : '隨機');
        
        alert(`【1-1 階段完成】\n\n您的選擇結果：\n・攻略對象性別：${targetText}\n・攻略對象：${charText}\n・玩家化身性別：${playerText}\n\n接下來將進入 1-2：展示確認畫面！`);
        
        // 測試用復原按鈕
        buttons.forEach(btn => btn.style.pointerEvents = 'auto');
    }, 600);
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
                const cards = document.querySelectorAll('.character-card');
                cards.forEach(card => {
                    card.classList.remove('selected');
                    card.style.pointerEvents = 'auto';
                });
            }
        }, 300);
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
