/**
 * 通用数字填充
 */
export function pad(num, size) {
  return String(num).padStart(size, '0');
}

/**
 * 倒计时核心数字展示（秒 + 毫秒）
 * @param {number} seconds 
 * @param {string} milliseconds 
 */
export function updateCountdownText(seconds, milliseconds) {
  const secStr = seconds.toString();
  const index = secStr.search(/[^0]/);
  const formatted = `<span style="color:black">${secStr.slice(0, index)}</span>${secStr.slice(index)}`;
  const el = document.getElementById("countdown");
  if (el) {
    el.innerHTML = `${formatted}.${milliseconds}`;
  } else {
    console.warn("⚠️ #countdown element not found.");
  }
}

/**
 * 更新年月日小时分秒展示
 * @param {Object} timeParts 
 */
export function updateTimePanel({ years, months, days, hours, minutes, seconds }) {
  const el = document.getElementById("time");
  if (el) {
    el.innerHTML =
      `${pad(years, 3)}-${pad(months, 2)}-${pad(days, 2)}-${pad(hours, 2)}:` +
      `${pad(minutes, 2)}:${pad(seconds, 2)}`;
  } else {
    console.warn("⚠️ #time element not found.");
  }
}

/**
 * 更新剩余天数，并切换显示状态
 * @param {number} totalDays 
 */
export function updateDayCounter(totalDays) {
  const el = document.getElementById("countdownday");
  const val = document.getElementById("totalDays");
  if (el && val) {
    console.log("🌕 totalDays =", totalDays); // ✅ 添加日志，方便调试
    val.innerText = totalDays;
    el.style.display = totalDays < 1 ? "none" : "block";
  } else {
    console.warn("⚠️ #countdownday or #totalDays element not found.");
  }
}



/**
 * 同步当前时间至输入框
 */
export function syncTimeFields() {
  const now = new Date();
  const map = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    second: now.getSeconds()
  };
  Object.keys(map).forEach(key => {
    const el = document.getElementById(key);
    if (el) el.value = pad(map[key], key === "year" ? 4 : 2);
  });
}

/**
 * 启用或退出全屏
 */
export function toggleFullscreen() {
  const content = document.getElementById("content");
  if (!content) return;
  if (!document.fullscreenElement) {
    content.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

/**
 * 高亮被点击的按钮
 * @param {HTMLElement} button 
 */
export function highlightActiveButton(button) {
  document.querySelectorAll('.button').forEach(btn => {
    btn.style.border = "none";
    btn.style.backgroundColor = "#000";
  });
  if (button) {
    button.style.border = "1px solid #fb7c00";
    button.style.backgroundColor = "#111";
  }
}

/**
 * 元素闪烁效果（用于视觉提醒）
 * @param {string} elementId 
 * @param {number} duration 
 */
export function blinkElement(elementId, duration = 1000) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.style.transition = `opacity ${duration / 2}ms ease-in-out`;
  el.style.opacity = 0.25;
  setTimeout(() => {
    el.style.opacity = 1;
  }, duration / 2);
}
