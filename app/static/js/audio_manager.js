/**
 * ==========================================================================
 * 戀愛互動式故事網站 - 音訊管理器 (AudioManager Singleton)
 * 負責全域 BGM/SFX 的播放、音量調諧、靜音、淡入淡出與音訊避讓 (Ducking)
 * ==========================================================================
 */

class AudioManager {
  constructor() {
    if (AudioManager.instance) {
      return AudioManager.instance;
    }

    // 讀取本地快取的音量設定
    this.bgmVolume = parseFloat(localStorage.getItem('bgmVolume')) !== undefined 
                     ? parseFloat(localStorage.getItem('bgmVolume')) 
                     : 0.5;
    this.sfxVolume = parseFloat(localStorage.getItem('sfxVolume')) !== undefined 
                     ? parseFloat(localStorage.getItem('sfxVolume')) 
                     : 0.8;
    this.isMuted = localStorage.getItem('isMuted') === 'true';
    
    this.currentBGM = null;          // 當前播放的 BGM Audio 物件
    this.activeSFXs = new Set();     // 當前正在播放的 SFX Audio 物件集合
    this.audioUnlocked = false;      // 瀏覽器安全解鎖狀態
    this.bgmDucked = false;          // 音訊避讓中狀態

    // 定期將播放中的 BGM 進度儲存至 localStorage，以便頁面載入/跳轉時復原
    setInterval(() => {
      if (this.currentBGM && !this.currentBGM.paused) {
        localStorage.setItem('currentBgmTime', this.currentBGM.currentTime.toString());
      }
    }, 1000);

    AudioManager.instance = this;
  }

  /**
   * 取得 AudioManager 單一實例 (Singleton)
   */
  static getInstance() {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * 解鎖瀏覽器 Autoplay 限制 (由首個點擊事件觸發)
   */
  unlockAudio() {
    if (this.audioUnlocked) return;
    
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        const context = new AudioContextClass();
        if (context.state === 'suspended') {
          context.resume();
        }
      }
      this.audioUnlocked = true;
      console.log("🔊 Audio Context Unlocked Successfully.");
    } catch (e) {
      console.error("解鎖 AudioContext 發生錯誤：", e);
    }
  }

  /**
   * 播放或切換背景音樂 (支援淡入淡出 Cross-fade)
   * @param {string} src 音源路徑
   */
  playBGM(src) {
    if (!src) return;

    // 若點擊時未解鎖，自動觸發一次解鎖
    if (!this.audioUnlocked) this.unlockAudio();

    // 如果是同一首，且正在播放中，則直接返回
    if (this.currentBGM && this.currentBGM.src.endsWith(src)) {
      if (this.currentBGM.paused && !this.isMuted) {
        this.currentBGM.play().catch(err => console.log("BGM 恢復播放受阻：", err));
      }
      return;
    }

    // 建立新背景音軌
    const newBGM = new Audio(src);
    newBGM.loop = true;
    newBGM.volume = 0; // 從靜音開始淡入

    // 嘗試還原播放進度
    const savedSrc = localStorage.getItem('currentBgmSrc');
    const savedTime = localStorage.getItem('currentBgmTime');
    if (savedSrc && savedSrc.endsWith(src) && savedTime) {
      const time = parseFloat(savedTime);
      if (!isNaN(time) && time > 0) {
        newBGM.currentTime = time;
      }
    }

    // 儲存當前播放的 BGM 路徑與進度
    localStorage.setItem('currentBgmSrc', src);
    localStorage.setItem('currentBgmTime', '0');

    if (this.currentBGM) {
      // 觸發舊音樂淡出，新音樂淡入過渡
      this.fadeTransition(this.currentBGM, newBGM);
    } else {
      this.currentBGM = newBGM;
      if (!this.isMuted) {
        newBGM.play().then(() => {
          this.fadeVolume(newBGM, 0, this.bgmVolume, 1000); // 1 秒淡入
        }).catch(err => {
          console.warn("BGM 自動播放被瀏覽器阻擋，將在玩家首次點擊後播放。", err);
        });
      }
    }
  }

  /**
   * 播放情境音效 (SFX)
   * @param {string} src 音源路徑
   * @param {boolean} loop 是否循環 (預設為 false)
   */
  playSFX(src, loop = false) {
    if (!src) return null;
    if (!this.audioUnlocked) this.unlockAudio();

    // 從物件池中尋找已載入且閒置的音訊物件，避免每次播放都建立 new Audio 導致延遲
    if (!this.sfxPools) {
      this.sfxPools = new Map();
    }
    if (!this.sfxPools.has(src)) {
      this.sfxPools.set(src, []);
    }
    const pool = this.sfxPools.get(src);
    let sfx = pool.find(audio => audio.paused || audio.ended);
    if (!sfx) {
      sfx = new Audio(src);
      sfx.preload = 'auto';
      sfx.load();
      pool.push(sfx);
    }

    sfx.loop = loop;
    sfx.volume = this.isMuted ? 0 : this.sfxVolume;
    sfx.currentTime = 0; // 重設播放起點

    // 觸發音訊避讓 (Ducking)：非循環、響亮的情境音效才避讓
    if (!loop && !this.isMuted && this.currentBGM) {
      this.applyAudioDucking();
    }

    sfx.play().catch(err => console.warn("音效播放失敗或被阻擋：", err));
    this.activeSFXs.add(sfx);

    sfx.onended = () => {
      this.activeSFXs.delete(sfx);
    };

    return sfx;
  }

  /**
   * 音訊避讓 (Ducking) 實作
   * 降低背景音樂音量以突顯劇情音效
   */
  applyAudioDucking() {
    if (!this.currentBGM || this.isMuted || this.bgmDucked) return;
    
    this.bgmDucked = true;
    const targetVolume = this.bgmVolume * 0.3; // 降音至 30%
    const originalVolume = this.bgmVolume;

    // 0.2 秒快速降音
    this.fadeVolume(this.currentBGM, this.currentBGM.volume, targetVolume, 200);

    // 假設普通音效持續 1.5 秒，之後 0.5 秒淡回原音量
    setTimeout(() => {
      if (this.currentBGM && !this.isMuted) {
        this.fadeVolume(this.currentBGM, this.currentBGM.volume, originalVolume, 500);
      }
      this.bgmDucked = false;
    }, 1500);
  }

  /**
   * 漸變調整音量輔助函式
   */
  fadeVolume(audio, start, end, duration) {
    if (!audio) return;
    const steps = 20;
    const stepTime = duration / steps;
    const volumeStep = (end - start) / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      let nextVolume = start + (volumeStep * currentStep);
      nextVolume = Math.max(0, Math.min(1, nextVolume)); // 防禦性限制
      audio.volume = nextVolume;

      if (currentStep >= steps) {
        clearInterval(interval);
        audio.volume = end;
      }
    }, stepTime);
  }

  /**
   * 舊音軌淡出並暫停，新音軌淡入之 Cross-fade
   */
  fadeTransition(oldAudio, newAudio) {
    const fadeDuration = 1200; // 1.2 秒
    
    // 舊音軌淡出
    this.fadeVolume(oldAudio, oldAudio.volume, 0, fadeDuration);
    
    setTimeout(() => {
      oldAudio.pause();
      this.currentBGM = newAudio;
      
      if (!this.isMuted) {
        newAudio.play().then(() => {
          this.fadeVolume(newAudio, 0, this.bgmVolume, fadeDuration);
        }).catch(err => console.warn(err));
      }
    }, fadeDuration);
  }

  /**
   * 全域背景音樂 (BGM) 音量設定
   */
  setBGMVolume(val) {
    this.bgmVolume = val;
    localStorage.setItem('bgmVolume', val);
    if (this.currentBGM && !this.isMuted) {
      this.currentBGM.volume = val;
    }
  }

  /**
   * 全域情境音效 (SFX) 音量設定
   */
  setSFXVolume(val) {
    this.sfxVolume = val;
    localStorage.setItem('sfxVolume', val);
    this.activeSFXs.forEach(sfx => {
      sfx.volume = val;
    });
  }

  /**
   * 一鍵靜音與解除靜音
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('isMuted', this.isMuted);
    
    if (this.isMuted) {
      if (this.currentBGM) this.currentBGM.volume = 0;
      this.activeSFXs.forEach(sfx => sfx.volume = 0);
    } else {
      if (this.currentBGM) this.currentBGM.volume = this.bgmVolume;
      this.activeSFXs.forEach(sfx => sfx.volume = this.sfxVolume);
    }
    return this.isMuted;
  }
}

export default AudioManager;
