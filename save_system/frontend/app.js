// 模擬玩家與故事狀態
const MOCK_PLAYER_ID = 1;
const STORY_ID = 'main_story_01';

// 模擬劇情資料
const storyNodes = [
    { chapter: 1, text: "這是一個關於選擇與命運的故事...", node: "intro" },
    { chapter: 1, text: "你走進了一個昏暗的房間，桌上放著一封信。", node: "room_enter" },
    { chapter: 1, text: "信件上寫著：『一切都將在今晚結束。』", node: "read_letter" },
    { chapter: 2, text: "第二章：未知的旅程。你決定離開房間尋找真相。", node: "chapter_2_start" }
];

let currentNodeIndex = 0;

// DOM 元素
const storyScreen = document.getElementById('storyScreen');
const chapterTitle = document.getElementById('chapterTitle');
const dialogueText = document.getElementById('dialogueText');
const nextBtn = document.getElementById('nextBtn');
const saveToast = document.getElementById('saveToast');
const reviewSavesBtn = document.getElementById('reviewSavesBtn');
const savesModal = document.getElementById('savesModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const savesList = document.getElementById('savesList');

// API 基礎 URL (假設未來後端運行在 3000 port)
const API_BASE_URL = 'http://localhost:3000/api';

// 更新畫面顯示
function updateStoryScreen() {
    const currentNode = storyNodes[currentNodeIndex];
    chapterTitle.textContent = `Chapter ${currentNode.chapter}`;
    
    // 淡出淡入效果
    dialogueText.style.opacity = 0;
    setTimeout(() => {
        dialogueText.textContent = currentNode.text;
        dialogueText.style.opacity = 1;
    }, 300);
}

// 觸發自動存檔
async function triggerAutoSave() {
    const currentNode = storyNodes[currentNodeIndex];
    
    const saveData = {
        player_id: MOCK_PLAYER_ID,
        story_id: STORY_ID,
        current_chapter: currentNode.chapter,
        current_node: currentNode.node,
        saved_state: {
            inventory: ['letter'],
            health: 100,
            mood: 'curious'
        }
    };

    try {
        // 在沒有後端的情況下，只會顯示 Error，但我們在前端模擬成功動畫
        const response = await fetch(`${API_BASE_URL}/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(saveData)
        });
        
        if (!response.ok) throw new Error('API Error');
        showSaveToast();
    } catch (error) {
        console.log('後端未啟動，模擬存檔成功:', saveData);
        showSaveToast(); // 即使後端沒開，也顯示 UI 動畫讓用戶看見效果
    }
}

// 顯示存檔成功提示
function showSaveToast() {
    saveToast.classList.remove('hidden');
    saveToast.classList.add('show');
    
    setTimeout(() => {
        saveToast.classList.remove('show');
        setTimeout(() => saveToast.classList.add('hidden'), 400); // 等待動畫完成
    }, 2000);
}

// 點擊下一步
nextBtn.addEventListener('click', () => {
    if (currentNodeIndex < storyNodes.length - 1) {
        currentNodeIndex++;
        updateStoryScreen();
        triggerAutoSave();
    } else {
        dialogueText.textContent = "故事已經結束，感謝遊玩。";
        nextBtn.style.display = 'none';
    }
});

// 開啟回顧存檔 Modal
reviewSavesBtn.addEventListener('click', async () => {
    savesModal.classList.remove('hidden');
    savesList.innerHTML = '<div class="loading-text">載入存檔中...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/saves/${MOCK_PLAYER_ID}`);
        if (!response.ok) throw new Error('API Error');
        const { data } = await response.json();
        renderSaves(data);
    } catch (error) {
        console.log('後端未啟動，模擬渲染存檔列表');
        // 模擬假資料
        renderSaves([
            {
                progress_id: 1,
                story_id: 'main_story_01',
                current_chapter: 1,
                current_node: 'read_letter',
                last_played_at: new Date().toISOString()
            }
        ]);
    }
});

// 渲染存檔列表
function renderSaves(saves) {
    if (!saves || saves.length === 0) {
        savesList.innerHTML = '<div class="loading-text">目前沒有任何存檔紀錄</div>';
        return;
    }

    savesList.innerHTML = saves.map(save => {
        const date = new Date(save.last_played_at).toLocaleString('zh-TW');
        return `
            <div class="save-item">
                <div class="save-info">
                    <h3>章節 ${save.current_chapter} - 節點: ${save.current_node}</h3>
                    <p>最後存檔時間: ${date}</p>
                </div>
                <button class="load-btn" onclick="alert('模擬載入進度 ID: ${save.progress_id}')">讀取</button>
            </div>
        `;
    }).join('');
}

// 關閉 Modal
closeModalBtn.addEventListener('click', () => {
    savesModal.classList.add('hidden');
});

// 初始化
updateStoryScreen();
