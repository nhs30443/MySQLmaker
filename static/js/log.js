// -------------------- ログ出力（行ごとにコピーボタン） --------------------
function addLog(message, type = "info") {
    const queryApp = document.querySelector('.app-query');
    const logView = queryApp && !queryApp.hidden
        ? document.getElementById('query-log-view')
        : document.getElementById('log-view');
    if (!logView) return;

    const row = document.createElement("div");
    row.className = `log-row ${type}`;

    // テキストとコピーボタンを内包する
    const textSpan = document.createElement("span");
    textSpan.textContent = message;
    row.appendChild(textSpan);

    const copyBtn = document.createElement("button");
    copyBtn.className = "log-copy-btn";
    copyBtn.onclick = () => {
        navigator.clipboard.writeText(message)
    };
    row.appendChild(copyBtn);

    // 初期状態で透明にして追加
    row.style.opacity = 0;
    row.style.transition = "opacity 0.3s ease";

    logView.appendChild(row);

    // 少しタイムアウトしてからフェードイン
    requestAnimationFrame(() => {
        row.style.opacity = 1;
    });

    // 常に一番下へスクロール
    logView.scrollTop = logView.scrollHeight;
}
