const configBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const settingsCloseBtn = document.getElementById('close-modal');
const form = document.getElementById('config-form');

// モーダル共通制御セット
const settingsModalCtrl = setupModal(configBtn, settingsModal, settingsCloseBtn,{
    enabledColor: '#d0d0d0',
    disabledColor: '#777777'
});

// 設定ボタンでモーダル表示
configBtn.addEventListener('click', settingsModalCtrl.openModal);

// 保存ボタン
form.addEventListener('submit', async (e) => {
    e.preventDefault();

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
            settingsModalCtrl.closeModal();
        } else {
            showFlashMessage(result.error, "red");
        }
    } catch (err) {
        showFlashMessage("通信エラー", "red");
    }
});
