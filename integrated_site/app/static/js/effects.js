/**
 * ==========================================================================
 * 戀愛互動式故事網站 - 互動視覺特效管理器 (InteractionEffects)
 * 負責文字逐字打字機、場景 Cross-fade、畫面震動及閃爍特效
 * ==========================================================================
 */

class InteractionEffects {
  /**
   * 逐字顯示打字機效果
   * @param {HTMLElement} element 目標 HTML 容器
   * @param {string} text 要顯示的完整文字
   * @param {number} speed 速度 (ms/字，預設 50ms)
   * @param {Function} callback 完成後的 callback
   */
  static typewriter(element, text, speed = 50, callback = null) {
    if (!element) return;
    
    element.textContent = "";
    let index = 0;
    
    // 如果該容器正在播放舊的打字動畫，先將其清除
    const existingInterval = element.getAttribute('data-typewriter-interval');
    if (existingInterval) {
      clearInterval(parseInt(existingInterval));
    }

    const interval = setInterval(() => {
      element.textContent += text.charAt(index);
      index++;
      if (index >= text.length) {
        clearInterval(interval);
        element.removeAttribute('data-typewriter-interval');
        element.removeAttribute('data-full-text');
        if (callback) callback();
      }
    }, speed);

    // 將 Interval ID 與完整文字保存在 DOM Attribute 中，便於隨時跳過 (Skip)
    element.setAttribute('data-typewriter-interval', interval.toString());
    element.setAttribute('data-full-text', text);
  }

  /**
   * 快速跳過打字機動畫，直接顯示完整文字
   */
  static skipTypewriter(element, callback = null) {
    if (!element) return false;

    const intervalStr = element.getAttribute('data-typewriter-interval');
    const fullText = element.getAttribute('data-full-text');

    if (intervalStr) {
      clearInterval(parseInt(intervalStr));
      element.removeAttribute('data-typewriter-interval');
      element.removeAttribute('data-full-text');
      element.textContent = fullText || "";
      if (callback) callback();
      return true;
    }
    return false;
  }

  /**
   * 觸發畫面震動特效 (配合驚嚇、衝擊、心跳情節)
   * @param {HTMLElement} target 震動目標 (預設為 document.body)
   */
  static triggerShake(target = document.body) {
    if (!target) return;

    target.classList.remove('effect-shake');
    // 強制重繪以重啟 CSS Animation
    void target.offsetWidth; 
    target.classList.add('effect-shake');
    
    setTimeout(() => {
      target.classList.remove('effect-shake');
    }, 500); // 震動動畫持續 0.5 秒
  }

  /**
   * 觸發全螢幕閃爍特效 (受傷紅光、戀愛粉紅、拍照白光)
   * @param {string} color 閃爍顏色 (預設為紅色)
   */
  static triggerFlash(color = 'rgba(255, 0, 0, 0.35)') {
    let flashOverlay = document.getElementById('flash-overlay');
    if (!flashOverlay) {
      flashOverlay = document.createElement('div');
      flashOverlay.id = 'flash-overlay';
      document.body.appendChild(flashOverlay);
    }
    
    flashOverlay.style.backgroundColor = color;
    flashOverlay.classList.remove('effect-flash');
    void flashOverlay.offsetWidth; // 重置動畫
    flashOverlay.classList.add('effect-flash');
    
    setTimeout(() => {
      flashOverlay.classList.remove('effect-flash');
    }, 400); // 特效持續 0.4 秒
  }

  /**
   * 背景圖片平滑交叉淡入淡出 (Cross-fade)
   * @param {HTMLElement} bgElement 背景容器 DOM
   * @param {string} newSrc 新背景圖片路徑
   */
  static applyCrossFade(bgElement, newSrc) {
    if (!bgElement || !newSrc) return;

    // 若圖片相同則跳過
    if (bgElement.style.backgroundImage.includes(newSrc)) return;

    // 將當前背景淡出
    bgElement.style.opacity = '0';

    setTimeout(() => {
      // 載入新圖片並淡入
      bgElement.style.backgroundImage = `url('${newSrc}')`;
      bgElement.style.opacity = '1';
    }, 400); // 與 CSS 的 0.8s 轉場搭配
  }
}

export default InteractionEffects;
