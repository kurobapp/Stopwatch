document.addEventListener("DOMContentLoaded", function () {
    var bridge;
    new QWebChannel(qt.webChannelTransport, function (channel) {
        bridge = channel.objects.bridge;
    });

    let timer;
    let elapsedTime = 0;
    let running = false;
    let mode = "stopwatch"; // "stopwatch" or "timer"
    let countdownTime = 0;
    let minutes = 0;
    let seconds = 0;

    function formatTime(ms) {
        let totalSeconds = Math.floor(ms / 1000);
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        let milliseconds = Math.floor((ms % 1000) / 10);

        return (
            String(minutes).padStart(2, "0") + ":" +
            String(seconds).padStart(2, "0") + ":" +
            String(milliseconds).padStart(2, "00")
        );
    }

    function updateDisplay() {
        document.getElementById("time-display").innerText = formatTime(elapsedTime);
    }

    // スタートボタンの処理
    document.getElementById("start-btn").addEventListener("click", function () {
        if (mode === "stopwatch") {
            if (!running) {
                running = true;
                let startTime = Date.now() - elapsedTime;
                timer = setInterval(function () {
                    elapsedTime = Date.now() - startTime;
                    updateDisplay();
                }, 10);
                if (bridge) bridge.logMessage("ストップウォッチ開始！");
            }
        } else {
            countdownTime = (minutes * 60 + seconds) * 1000; // タイマーの時間を設定
            if (!running && countdownTime > 0) {
                running = true;
                let endTime = Date.now() + countdownTime;
                timer = setInterval(function () {
                    let remaining = endTime - Date.now();
                    if (remaining <= 0) {
                        clearInterval(timer);
                        running = false;
                        elapsedTime = 0;
                        document.getElementById("time-display").innerText = "00:00:00";
                        if (bridge) bridge.timerFinished();
                        if (bridge) bridge.logMessage("タイマー終了！");
                    } else {
                        elapsedTime = remaining;
                        updateDisplay();
                    }
                }, 10);
                if (bridge) bridge.logMessage("タイマー開始！");
            }
        }
    });

    // ストップボタンの処理
    document.getElementById("stop-btn").addEventListener("click", function () {
        if (running) {
            running = false;
            clearInterval(timer);
            if (bridge) bridge.logMessage(mode === "stopwatch" ? "ストップウォッチ停止！" : "タイマー停止！");
        }
    });

    // リセットボタンの処理
    document.getElementById("reset-btn").addEventListener("click", function () {
        running = false;
        clearInterval(timer);
        elapsedTime = 0;
        minutes = 0;
        seconds = 0;
        updateDisplay();
        if (bridge) bridge.logMessage(mode === "stopwatch" ? "ストップウォッチリセット！" : "タイマーリセット！");
    });

    // モード切替ボタンの処理
    document.getElementById("toggle-mode-btn").addEventListener("click", function () {
        mode = mode === "stopwatch" ? "timer" : "stopwatch";
        document.getElementById("mode-title").innerText = mode === "stopwatch" ? "ストップウォッチ" : "タイマー";
        document.getElementById("toggle-mode-btn").innerText = mode === "stopwatch" ? "⏳ タイマーに切り替え" : "⏱ ストップウォッチに切り替え";
        document.getElementById("timer-input").style.display = mode === "timer" ? "block" : "none";
        elapsedTime = 0;
        updateDisplay();
    });

    // // タイマーの時間管理
    // // 分の増減
    // document.querySelectorAll(".time-adjust").forEach(button => {
    //     button.addEventListener("click", function () {
    //         let increaseMinutes = parseInt(this.getAttribute("data-increase"), 10);
    //         minutes += increaseMinutes;  // 分数を増やす
    //         if (minutes < 0) minutes = 0; // 負の分数にならないように
    //         if (minutes >= 60) minutes = 59; // 60分以上にしない
    //         updateDisplay(); // 表示を更新
    //     });
    // });

    // // 秒数の増減
    // document.querySelectorAll(".time-adjust-seconds").forEach(button => {
    //     button.addEventListener("click", function () {
    //         let increaseSeconds = parseInt(this.getAttribute("data-increase"), 10);
    //         seconds += increaseSeconds; // 秒数を増やす
    //         if (seconds < 0) seconds = 0; // 負の秒数にならないように
    //         if (seconds >= 60) seconds = 59; // 60秒以上にしない
    //         updateDisplay(); // 表示を更新
    //     });
    // });
});
