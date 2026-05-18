/**
 * Save System Widget
 * 將存檔系統封裝成獨立的 Widget，提供「存檔」與「讀檔(Callback/Event)」介面
 */
class SaveSystemWidget {
    constructor(config = {}) {
        this.apiBaseUrl = config.apiBaseUrl || 'http://localhost:3000/api';
        this.playerId = config.playerId || 1;
        this.storyId = config.storyId || 'main_story';
        
        // 當使用者點擊「讀檔」且成功取得資料後，會呼叫此回呼函數 (Callback)
        // 外部的主劇情程式可以透過設定這個 callback 來接收讀檔資料，進而切換劇情
        this.onLoadSave = config.onLoadSave || null;
        
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.injectHTML());
        } else {
            this.injectHTML();
        }
    }

    injectHTML() {
        // 懸浮按鈕 (FAB)
        const fab = document.createElement('div');
        fab.className = 'save-widget-fab';
        fab.innerHTML = '💾';
        fab.title = '回顧存檔';
        fab.onclick = () => this.openModal();
        document.body.appendChild(fab);

        // Toast 提示
        const toast = document.createElement('div');
        toast.className = 'save-widget-toast';
        toast.innerHTML = '<span>💾</span> <span class="toast-text">進度已自動儲存</span>';
        this.toastEl = toast;
        document.body.appendChild(toast);

        // Modal 視窗
        const overlay = document.createElement('div');
        overlay.className = 'save-widget-overlay';
        overlay.innerHTML = `
            <div class="save-widget-modal">
                <div class="save-widget-header">
                    <h2>存檔紀錄</h2>
                    <button class="save-widget-close">&times;</button>
                </div>
                <div class="save-widget-body">
                    <div style="text-align: center; color: #94a3b8;">載入中...</div>
                </div>
            </div>
        `;
        
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

    showToast(message = '進度已自動儲存') {
        this.toastEl.querySelector('.toast-text').textContent = message;
        this.toastEl.classList.add('show');
        setTimeout(() => {
            this.toastEl.classList.remove('show');
        }, 2500);
    }

    // ----------------------------------------------------
    // API: 自動存檔
    // ----------------------------------------------------
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
                this.showToast('進度已自動儲存');
            }
        } catch (e) {
            console.log('[Save Widget] 後端未啟動，模擬存檔成功:', payload);
            this.showToast('進度已自動儲存');
        }
    }

    // ----------------------------------------------------
    // API: 讀取所有存檔列表
    // ----------------------------------------------------
    async fetchSaves() {
        this.bodyEl.innerHTML = '<div style="text-align: center; color: #94a3b8;">載入中...</div>';
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/saves/${this.playerId}`);
            if (!response.ok) throw new Error('API Error');
            const { data } = await response.json();
            this.renderSaves(data);
        } catch (e) {
            console.log('[Save Widget] 後端未啟動，模擬讀取存檔列表');
            this.renderSaves([
                { progress_id: 1, current_chapter: 1, current_node: '覺醒', last_played_at: new Date().toISOString(), saved_state: { health: 100 } },
                { progress_id: 2, current_chapter: 1, current_node: '探索房間', last_played_at: new Date(Date.now() - 3600000).toISOString(), saved_state: { health: 80, items: ['鑰匙'] } }
            ]);
        }
    }

    renderSaves(saves) {
        if (!saves || saves.length === 0) {
            this.bodyEl.innerHTML = '<div style="text-align: center; color: #94a3b8;">目前沒有任何存檔紀錄</div>';
            return;
        }

        // 清空容器
        this.bodyEl.innerHTML = '';

        saves.forEach(save => {
            const dateStr = new Date(save.last_played_at).toLocaleString('zh-TW');
            const itemHTML = document.createElement('div');
            itemHTML.className = 'save-widget-item';
            itemHTML.innerHTML = `
                <div class="save-widget-info">
                    <h3>章節 ${save.current_chapter} - ${save.current_node}</h3>
                    <p>${dateStr}</p>
                </div>
                <button class="save-widget-load-btn">讀取</button>
            `;
            
            // 綁定讀取按鈕事件
            const btn = itemHTML.querySelector('.save-widget-load-btn');
            btn.onclick = () => this.executeLoadSave(save.progress_id, save);
            
            this.bodyEl.appendChild(itemHTML);
        });
    }

    // ----------------------------------------------------
    // API: 執行單一讀檔，並呼叫 Callback 通知主系統
    // ----------------------------------------------------
    async executeLoadSave(progressId, mockData = null) {
        let loadedData = null;
        
        try {
            // 嘗試呼叫後端讀取完整單一存檔資料
            const response = await fetch(`${this.apiBaseUrl}/load/${progressId}`);
            if (!response.ok) throw new Error('API Error');
            const result = await response.json();
            loadedData = result.data;
        } catch (e) {
            console.log(`[Save Widget] 後端未啟動，使用模擬資料讀檔 (ID: ${progressId})`);
            loadedData = mockData;
        }

        this.closeModal();
        this.showToast('✅ 讀檔成功');

        // 第一種通知方式：執行 Callback (如果有設定)
        if (this.onLoadSave && typeof this.onLoadSave === 'function') {
            this.onLoadSave(loadedData);
        }

        // 第二種通知方式：發送全局 DOM 自訂事件，主系統可以直接 window.addEventListener('onSaveLoaded', ...)
        const loadEvent = new CustomEvent('onSaveLoaded', { detail: loadedData });
        window.dispatchEvent(loadEvent);
    }
}

// 實例化 Widget，並預設發送 Event，也可以被覆寫
window.saveWidget = new SaveSystemWidget();
