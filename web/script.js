let mode = 'stopwatch'; // 'stopwatch' or 'timer'
let timeElapsed = 0;    // For stopwatch
let timerMinutes = 0;   // For timer (minutes)
let timerSeconds = 0;   // For timer (seconds)
let timerInterval = null;
let stopwatchInterval = null;
let studyCycleInProgress = false;  // 勉強サイクル進行中かどうかのフラグ
let totalStudyTime = 0;  // 累積勉強時間
let currentCycleIndex = 0;  // 現在のサイクルのインデックス

// 勉強時間と休憩時間のサイクル設定
const studyCycle = [
    { study: 1, break: 0.5 },  // 1分勉強 → 30秒休憩
    { study: 2, break: 1 },    // 2分勉強 → 1分休憩
    { study: 3, break: 1.5 },  // 3分勉強 → 1分半休憩
];

// ストップウォッチとタイマーのモードを切り替え
document.getElementById('toggle-mode-btn').addEventListener('click', () => {
    if (mode === 'stopwatch') {
        mode = 'timer';
        document.getElementById('mode-title').textContent = 'タイマー';
        document.getElementById('timer-input').style.display = 'block';
        document.getElementById('toggle-mode-btn').textContent = 'ストップウォッチに切り替え';
        document.getElementById('study-btn').style.display = 'inline-block';  // タイマー時に勉強ボタンを表示
        document.getElementById('end-study-btn').style.display = 'none';  // 勉強終了ボタンを非表示
        resetStopwatch();
    } else {
        mode = 'stopwatch';
        document.getElementById('mode-title').textContent = 'ストップウォッチ';
        document.getElementById('timer-input').style.display = 'none';
        document.getElementById('toggle-mode-btn').textContent = 'タイマーに切り替え';
        document.getElementById('study-btn').style.display = 'none';  // ストップウォッチ時に勉強ボタンを非表示
        document.getElementById('end-study-btn').style.display = 'none';  // 勉強終了ボタンを非表示
        resetTimer();
    }
});

// 勉強ボタンのイベントリスナー
document.getElementById('study-btn').addEventListener('click', () => {
    if (!studyCycleInProgress) {
        studyCycleInProgress = true;  // サイクル開始中フラグを立てる
        startStudyCycle();
        document.getElementById('study-btn').style.display = 'none';  // 勉強ボタンを非表示
        document.getElementById('end-study-btn').style.display = 'inline-block';  // 勉強終了ボタンを表示
    } else {
        alert("勉強サイクルが進行中です。");
    }
});

// 勉強サイクルを開始する関数
function startStudyCycle() {
    if (totalStudyTime >= 25) {
        alert('勉強時間は25分を超えません');
        studyCycleInProgress = false;  // サイクル終了フラグを元に戻す
        return;
    }

    let studyTime = studyCycle[currentCycleIndex].study * 60; // 勉強時間を秒に変換
    let breakTime = studyCycle[currentCycleIndex].break * 60; // 休憩時間を秒に変換

    // 勉強時間のカウントダウン
    startTimer(studyTime, '勉強中', () => {
        totalStudyTime += studyCycle[currentCycleIndex].study;
        if (totalStudyTime >= 25) {
            alert('勉強時間は25分を超えません');
            studyCycleInProgress = false;  // サイクル終了フラグを元に戻す
            return;
        }

        // 休憩時間のカウントダウン
        startTimer(breakTime, '休憩中', () => {
            currentCycleIndex = (currentCycleIndex + 1) % studyCycle.length; // 次のサイクルへ
            studyCycleInProgress = false;  // サイクル終了フラグを元に戻す
            startStudyCycle(); // 次のサイクルを再び呼び出す
        });
    });
}

document.getElementById('timer-minutes').addEventListener('input', (e) => {
    timerMinutes = parseInt(e.target.value) || 0;
    if (mode === 'timer') {
        document.getElementById('time-display').textContent = formatTime(timerMinutes * 60 + timerSeconds);
    }
});

document.getElementById('timer-seconds').addEventListener('input', (e) => {
    timerSeconds = parseInt(e.target.value) || 0;
    if (mode === 'timer') {
        document.getElementById('time-display').textContent = formatTime(timerMinutes * 60 + timerSeconds);
    }
});

// タイマー開始の関数
function startTimer(duration, status, callback) {
    let minutes = Math.floor(duration / 60);
    let seconds = duration % 60;
    document.getElementById('time-display').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    alert(status); // 現在のステータスを表示

    let interval = setInterval(() => {
        duration--;
        minutes = Math.floor(duration / 60);
        seconds = duration % 60;
        document.getElementById('time-display').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (duration <= 0) {
            clearInterval(interval);
            callback(); // 次の処理を実行
        }
    }, 1000);
}

// スタート/ストップボタンの処理
document.getElementById('main-btn').addEventListener('click', () => {
    if (mode === 'stopwatch') {
        if (stopwatchInterval) {
            clearInterval(stopwatchInterval);
            stopwatchInterval = null;
        } else {
            stopwatchInterval = setInterval(() => {
                timeElapsed++;
                document.getElementById('time-display').textContent = formatTime(timeElapsed);
            }, 1000);
        }
    } else {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        } else {
            // タイマー設定が0の時に警告
            if (timerMinutes <= 0 && timerSeconds <= 0) {
                alert("タイマーの時間を設定してください");
                return;
            }

            timerInterval = setInterval(() => {
                if (timerMinutes > 0 || timerSeconds > 0) {
                    if (timerSeconds === 0) {
                        if (timerMinutes > 0) {
                            timerMinutes--;
                            timerSeconds = 59;
                        }
                    } else {
                        timerSeconds--;
                    }
                    document.getElementById('time-display').textContent = formatTime(timerMinutes * 60 + timerSeconds);
                } else {
                    clearInterval(timerInterval);
                    alert('タイマー終了');
                    resetTimer();
                }
            }, 1000);
        }
    }
});

// リセットボタンの処理
document.getElementById('reset-btn').addEventListener('click', () => {
    if (mode === 'stopwatch') {
        resetStopwatch();
    } else {
        resetTimer();
        resetStudyCycle();  // 勉強モードのリセット
    }
});

// 時間のフォーマット（秒を hh:mm:ss に変換）
function formatTime(seconds) {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${minutes}:${secs}`;
}

// ストップウォッチのリセット
function resetStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    timeElapsed = 0;
    document.getElementById('time-display').textContent = '00:00';
}

// タイマーのリセット
function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerMinutes = 0;
    timerSeconds = 0;
    document.getElementById('time-display').textContent = '00:00';
    document.getElementById('timer-minutes').value = 0;
    document.getElementById('timer-seconds').value = 0;
}

// 勉強モードをリセット
function resetStudyCycle() {
    clearInterval(timerInterval);
    timerInterval = null;
    totalStudyTime = 0;
    currentCycleIndex = 0;
    document.getElementById('time-display').textContent = '00:00';
    document.getElementById('timer-minutes').value = 0;
    document.getElementById('timer-seconds').value = 0;
}
