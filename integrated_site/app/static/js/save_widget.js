/**
 * Save System Widget (Integrated with Python Flask)
 */
class SaveSystemWidget {
    constructor(config = {}) {
        // 使用相對路徑，讓它自動對接當前網站的 Python API
        this.apiBaseUrl = config.apiBaseUrl || '/api';
        this.playerId = config.playerId || 1;
        this.storyId = config.storyId || 'main_story';
        
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
        fab.innerHTML = '<span><i class="fa-solid fa-floppy-disk"></i></span> <span>回顧存檔</span>';
        fab.title = '回顧存檔';
        fab.onclick = () => this.openModal();
        document.body.appendChild(fab);

        // Toast 提示
        const toast = document.createElement('div');
        toast.className = 'save-widget-toast';
        toast.innerHTML = '<span><i class="fa-solid fa-check"></i></span> <span class="toast-text">進度已自動儲存</span>';
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
            } else {
                console.error('[Save Widget] 存檔失敗', await response.text());
            }
        } catch (e) {
            console.error('[Save Widget] API 呼叫失敗:', e);
            this.showToast('⚠️ 存檔失敗，請確認網路連線');
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
            this.bodyEl.innerHTML = '<div style="text-align: center; color: #ef4444;">讀取失敗，請確認您已登入。</div>';
        }
    }

    renderSaves(saves) {
        if (!saves || saves.length === 0) {
            this.bodyEl.innerHTML = '<div style="text-align: center; color: #94a3b8;">目前沒有任何存檔紀錄</div>';
            return;
        }

        this.bodyEl.innerHTML = '';
        saves.forEach(save => {
            const dateStr = new Date(save.last_played_at + 'Z').toLocaleString('zh-TW'); // SQLite saves in UTC usually
            const itemHTML = document.createElement('div');
            itemHTML.className = 'save-widget-item';
            itemHTML.innerHTML = `
                <div class="save-widget-info">
                    <h3>章節 ${save.current_chapter} - ${save.current_node}</h3>
                    <p>${dateStr}</p>
                </div>
                <button class="save-widget-load-btn">讀取</button>
            `;
            
            const btn = itemHTML.querySelector('.save-widget-load-btn');
            btn.onclick = () => this.executeLoadSave(save.progress_id, save);
            this.bodyEl.appendChild(itemHTML);
        });
    }

    async executeLoadSave(progressId, mockData = null) {
        let loadedData = null;
        try {
            const response = await fetch(`${this.apiBaseUrl}/load/${progressId}`);
            if (!response.ok) throw new Error('API Error');
            const result = await response.json();
            loadedData = result.data;
        } catch (e) {
            console.error(`[Save Widget] 讀檔失敗 (ID: ${progressId})`, e);
            alert('讀取存檔失敗');
            return;
        }

        this.closeModal();
        this.showToast('✅ 讀檔成功');

        if (this.onLoadSave && typeof this.onLoadSave === 'function') {
            this.onLoadSave(loadedData);
        }

        const loadEvent = new CustomEvent('onSaveLoaded', { detail: loadedData });
        window.dispatchEvent(loadEvent);
    }
}
