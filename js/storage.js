const STORAGE_KEY = 'countdownData';

/**
 * 读取本地存储的数据
 * @returns {Array<Object>}
 */
export function loadCountdownData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.error('Failed to parse countdownData:', e);
        return [];
    }
}

/**
 * 保存倒计时数据
 * @param {Array<Object>} data
 */
export function saveCountdownData(data) {
    const cleaned = data.map(d => {
        const { year, month, day, hour, minute } = d;
        return { year, month, day, hour, minute }; // 🚫 去掉 second
    });
    const unique = removeDuplicates(cleaned);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
}




/**
 * 添加单个数据
 * @param {Object} newData
 */
export function addCountdownEntry(newData) {
    const current = loadCountdownData();
    const cleanedCurrent = current.map(JSON.stringify);

    // ✅ 精简 newData 与 cleaned 格式保持一致
    const entryStr = JSON.stringify({
        year: newData.year,
        month: newData.month,
        day: newData.day,
        hour: newData.hour,
        minute: newData.minute
    });

    if (!cleanedCurrent.includes(entryStr)) {
        current.push(JSON.parse(entryStr));
        saveCountdownData(current);
    }
}



/**
 * 去除重复项
 * @param {Array<Object>} data
 * @returns {Array<Object>}
 */
function removeDuplicates(data) {
    const uniqueSet = new Set(data.map(JSON.stringify));
    return Array.from(uniqueSet).map(JSON.parse);
}
