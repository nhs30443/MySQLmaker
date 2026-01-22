// -------------------- ログ出力 --------------------
function addLog(message, type = "info") {
    const logView = document.getElementById("log-view");
    if (!logView) return;

    const row = document.createElement("div");
    row.className = `log-row ${type}`;
    row.textContent = message;

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
