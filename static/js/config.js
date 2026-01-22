const configBtn = document.getElementById('settings-btn');
const modal = document.getElementById('settings-modal');
const closeBtn = document.getElementById('close-modal');
const form = document.getElementById('config-form');

// 設定ボタンでモーダル表示
configBtn.addEventListener('click', () => {
    configBtn.disabled = true;
    configBtn.style.cursor = 'not-allowed';
    configBtn.style.pointerEvents = 'none';
    configBtn.style.backgroundColor = '#999999';

    modal.style.display = 'flex';
});

// モーダル閉じる処理共通
function closeModal() {
    modal.style.display = 'none';
    configBtn.disabled = false;
    configBtn.style.cursor = 'pointer';
    configBtn.style.pointerEvents = 'auto';
    configBtn.style.backgroundColor = '#ffffff';
}

// 閉じるボタン
closeBtn.addEventListener('click', closeModal);

// モーダル外クリック
window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// 保存ボタン
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // デフォルト送信防止

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const res = await fetch('/api/update_config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
            showFlashMessage(result.success, "green");
            closeModal();
        } else {
            showFlashMessage(result.error, "red");
        }
    } catch (err) {
        showFlashMessage("通信エラー", "red");
    }
});
