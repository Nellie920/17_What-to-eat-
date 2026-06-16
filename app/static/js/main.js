import AudioManager from './audio_manager.js';

// 初始化全域實例
const audio = AudioManager.getInstance();

document.addEventListener('DOMContentLoaded', () => {
  setupGlobalAudioInteractions();
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
      // 防止游標在按鈕內部子節點移動時重複觸發
      if (e.relatedTarget && target.contains(e.relatedTarget)) return;
      
      audio.playSFX('/static/audio/sfx/bubble_hover.wav');
    }
  });

  document.addEventListener('click', (e) => {
    const target = e.target.closest(clickableSelectors);
    if (target) {
      audio.playSFX('/static/audio/sfx/select_confirm.wav');
    }
  });
}
