import {
    updateCountdownText,
    updateTimePanel,
    updateDayCounter,
    pad,
    syncTimeFields,
    toggleFullscreen,
    highlightActiveButton
} from './ui.js';

import {
    loadCountdownData,
    saveCountdownData,
    addCountdownEntry
} from './storage.js';

let countdownTimer = null;
let countdownData = [];
let updateSeconds, updateMinutes;
const audio = new Audio('mp3/bird2.mp3');

window.debugCountdownData = function () {
    const data = loadCountdownData();
    console.log("🧾 目前的记录如下：", data);
};


function getTimeInput() {
    return {
        year: document.getElementById("year").value,
        month: document.getElementById("month").value,
        day: document.getElementById("day").value,
        hour: document.getElementById("hour").value,
        minute: document.getElementById("minute").value,
        second: document.getElementById("second").value
    };
}

function displayCountdownData() {
    const container = document.getElementById("countdownData");
    container.innerHTML = "";

    const now = new Date();
    const current = loadCountdownData();

    // ✅ 先倒序，去除年月日时分相同的数据
    const seen = new Set();
    const deduplicated = [];

    current.slice().reverse().forEach(data => {
        const key = `${data.year}-${data.month}-${data.day}-${data.hour}-${data.minute}`;
        if (!seen.has(key)) {
            seen.add(key);
            deduplicated.push(data);
        }
    });

    // ✅ 保留最新的 5 条
    const latest = deduplicated.slice(0, 5);

    latest.forEach((data, i) => {
        const item = document.createElement("div");
        item.innerHTML = `data${i + 1}：${highlightFields(data, now)}`;
        item.addEventListener("click", () => {
            const filled = { ...data, second: new Date().getSeconds() };
            startCountdownFromData(filled);
        });

        container.appendChild(item);
    });
}


function highlightFields(data, now) {
    const fields = ['year', 'month', 'day', 'hour', 'minute'];
    const separators = ['-', '-', '-', '-', '']; // ✅ 最后一项为空字符串

    return fields.map((field, i) => {
        const nowVal = field === "month" ? now.getMonth() + 1 : now[field];
        const val = pad(data[field], field === "year" ? 4 : 2);
        const highlighted = val !== pad(nowVal, val.length)
            ? `<span style="color:#fb7c00;">${val}</span>`
            : val;
        return highlighted + separators[i];
    }).join('');
}


function updateCountdownDisplay(msRemaining) {
    const milliseconds = msRemaining % 1000;
    const seconds = Math.floor(msRemaining / 1000);

    updateCountdownText(seconds, pad(milliseconds, 3));

    const totalDays = Math.floor(seconds / 86400);

    // ✅ 插入调试输出
    console.log("⏱ 剩余秒数 =", seconds);
    console.log("🌕 计算出的 totalDays =", totalDays);

    updateDayCounter(totalDays);

    const years = Math.floor(seconds / 31104000);
    const months = Math.floor((seconds % 31104000) / 2592000);
    const days = Math.floor((seconds % 2592000) / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    updateTimePanel({ years, months, days, hours, minutes, seconds: secs });
}


export function startCountdown() {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        return;
    }

    const input = getTimeInput();
    const target = new Date(
        input.year, input.month - 1, input.day,
        input.hour, input.minute, input.second
    ).getTime();

    addCountdownEntry(input);
    countdownData = loadCountdownData();
    displayCountdownData();

    countdownTimer = setInterval(() => {
        const now = Date.now();
        const distance = target - now;

        if (distance <= 0) {
            clearInterval(countdownTimer);
            document.getElementById("countdown").innerText = "NOW";
            document.getElementById("time").innerText = "000-00-00-00:00:00";
            audio.play();
            window.addEventListener("keydown", () => audio.pause(), { once: true });
            window.addEventListener("click", () => audio.pause(), { once: true });
            return;
        }

        updateCountdownDisplay(distance);
    }, 30);
}

function startCountdownFromData(data) {
    // 设置输入字段
    Object.keys(data).forEach(key => {
        const field = document.getElementById(key);
        if (field) field.value = pad(data[key], key === "year" ? 4 : 2);
    });

    // 启动倒计时，但不保存新条目（避免重复）
    const target = new Date(
        data.year, data.month - 1, data.day,
        data.hour, data.minute, data.second
    ).getTime();

    if (countdownTimer) clearInterval(countdownTimer);

    countdownTimer = setInterval(() => {
        const now = Date.now();
        const distance = target - now;

        if (distance <= 0) {
            clearInterval(countdownTimer);
            document.getElementById("countdown").innerText = "NOW";
            document.getElementById("time").innerText = "000-00-00-00:00:00";
            audio.play();
            window.addEventListener("keydown", () => audio.pause(), { once: true });
            return;
        }

        updateCountdownDisplay(distance);
    }, 30);
}


export function resetCountdown() {
    if (countdownTimer) clearInterval(countdownTimer);
    if (updateSeconds) clearInterval(updateSeconds);
    if (updateMinutes) clearInterval(updateMinutes);

    document.getElementById("countdown").innerText = "000.000";
    document.getElementById("time").innerText = "000-00-00-00:00:00";
    syncTimeFields();

    updateSeconds = setInterval(() => {
        document.getElementById("second").value = pad(new Date().getSeconds(), 2);
    }, 1000);
    updateMinutes = setInterval(() => {
        document.getElementById("minute").value = pad(new Date().getMinutes(), 2);
    }, 60000);
}

document.addEventListener("DOMContentLoaded", () => {
    syncTimeFields();
    countdownData = loadCountdownData();
    displayCountdownData();

    document.querySelectorAll('[data-time]').forEach(btn => {
        btn.addEventListener("click", () => {
            const now = new Date();
            const offset = parseInt(btn.dataset.time) * 1000;
            const future = new Date(now.getTime() + offset);

            const input = {
                year: future.getFullYear(),
                month: future.getMonth() + 1,
                day: future.getDate(),
                hour: future.getHours(),
                minute: future.getMinutes(),
                second: future.getSeconds()
            };

            Object.keys(input).forEach(key => {
                document.getElementById(key).value = input[key];
            });

            addCountdownEntry({
                year: input.year,
                month: input.month,
                day: input.day,
                hour: input.hour,
                minute: input.minute
                // ✅ 不存 second，按照你简约的要求
            });

            countdownData = loadCountdownData();      // ✅ 加载
            displayCountdownData();                   // ✅ 更新页面
            highlightActiveButton(btn);               // ✅ 按钮高亮
            startCountdown();                         // ✅ 开始倒计时
        });
    });


    if (document.getElementById("fullscreenbutt")) {
        document.getElementById("fullscreenbutt").addEventListener("click", toggleFullscreen);
    }

    if (document.getElementById("startCountdown")) {
        document.getElementById("startCountdown").addEventListener("click", startCountdown);
    }

    if (document.getElementById("resetCountdown")) {
        document.getElementById("resetCountdown").addEventListener("click", resetCountdown);
    }
});
document.getElementById("about-button").addEventListener("click", () => {
    window.open("https://aj300542.github.io/", "_blank");
});
