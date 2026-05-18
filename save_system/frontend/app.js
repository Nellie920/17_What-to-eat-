/**
 * Save System Widget
 * 將存檔系統封裝成獨立的 Widget，可輕易整合到任何網站
 */
class SaveSystemWidget {
    constructor(config = {}) {
        this.apiBaseUrl = config.apiBaseUrl || 'http://localhost:3000/api';
        this.playerId = config.playerId || 1;
        this.storyId = config.storyId || 'main_story';
        
        // 初始化 Widget
        this.init();
    }

    init() {
        // 確保 DOM 載入後再注入 HTML
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.injectHTML());
        } else {
            this.injectHTML();
        }
    }

    injectHTML() {
        // 建立懸浮按鈕 (FAB)
        const fab = document.createElement('div');
        fab.className = 'save-widget-fab';
        fab.innerHTML = '💾';
        fab.title = '回顧存檔';
        fab.onclick = () => this.openModal();
        document.body.appendChild(fab);

        // 建立 Toast 提示
        const toast = document.createElement('div');
        toast.className = 'save-widget-toast';
        toast.innerHTML = '<span>💾</span> 進度已自動儲存';
        this.toastEl = toast;
        document.body.appendChild(toast);

        // 建立 Modal
        const overlay = document.createElement('div');
        overlay.className = 'save-widget-overlay';
        overlay.innerHTML = `
            <div class="save-widget-modal">
                <div class="save-widget-header">
                    <h2>存檔紀錄</h2>
                    <button class="save-widget-close">&times;</button>
                </div>
                <div class="save-widget-body">
                    <!-- 列表動態生成 -->
                    <div style="text-align: center; color: #94a3b8;">載入中...</div>
                </div>
            </div>
        `;
        
        // 綁定關閉事件
        overlay.querySelector('.save-widget-close').onclick = () => this.closeModal();
        overlay.onclick = (e) => {
            if (e.target === overlay) this.closeModal();
        };

        this.overlayEl = overlay;
        this.bodyEl = overlay.querySelector('.save-widget-body');
        document.body.appendChild(overlay);
    }

    openModal() {
        this.overlayEl.classList.add('active');
        this.fetchSaves();
    }

    closeModal() {
        this.overlayEl.classList.remove('active');
    }

    showToast() {
        this.toastEl.classList.add('show');
        setTimeout(() => {
            this.toastEl.classList.remove('show');
        }, 2500);
    }

    // 提供給主遊戲呼叫的公開方法：觸發自動存檔
    async triggerSave(chapter = 1, node = 'auto_save_point', state = {}) {
        const payload = {
            player_id: this.playerId,
            story_id: this.storyId,
            current_chapter: chapter,
            current_node: node,
            saved_state: state
        };

        try {
            const response = await fetch(`${this.apiBaseUrl}/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                this.showToast();
            }
        } catch (e) {
            console.log('[Save Widget] 後端未啟動，模擬存檔成功:', payload);
            this.showToast();
        }
    }

    async fetchSaves() {
        this.bodyEl.innerHTML = '<div style="text-align: center; color: #94a3b8;">載入中...</div>';
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/saves/${this.playerId}`);
            if (!response.ok) throw new Error('API Error');
            const { data } = await response.json();
            this.renderSaves(data);
        } catch (e) {
            console.log('[Save Widget] 後端未啟動，模擬讀取資料');
            // 模擬假資料
            this.renderSaves([
                { progress_id: 1, current_chapter: 1, current_node: '覺醒', last_played_at: new Date().toISOString() },
                { progress_id: 2, current_chapter: 1, current_node: '開場', last_played_at: new Date(Date.now() - 3600000).toISOString() }
            ]);
        }
    }

    renderSaves(saves) {
        if (!saves || saves.length === 0) {
            this.bodyEl.innerHTML = '<div style="text-align: center; color: #94a3b8;">目前沒有任何存檔紀錄</div>';
            return;
        }

        this.bodyEl.innerHTML = saves.map(save => {
            const dateStr = new Date(save.last_played_at).toLocaleString('zh-TW');
            return `
                <div class="save-widget-item">
                    <div class="save-widget-info">
                        <h3>章節 ${save.current_chapter} - ${save.current_node}</h3>
                        <p>${dateStr}</p>
                    </div>
                    <button class="save-widget-load-btn" onclick="alert('準備載入存檔ID: ${save.progress_id}')">讀取</button>
                </div>
            `;
        }).join('');
    }
}

// 實例化 Widget，並掛載到 window 全域物件，讓主遊戲可以呼叫
window.saveWidget = new SaveSystemWidget();
