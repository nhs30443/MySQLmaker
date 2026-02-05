/**
 * モーダル共通制御
 * @param {HTMLElement} openBtn   モーダルを開いたボタン
 * @param {HTMLElement} modalEl   モーダル要素
 * @param {HTMLElement} closeBtn  閉じるボタン
 * @param {Object} options        表示制御オプション
 * @param {string} options.enabledColor  ボタン有効時の背景色
 * @param {string} options.disabledColor ボタン無効時の背景色
 */
function setupModal(openBtn, modalEl, closeBtn, options = {}) {

    const {
        enabledColor  = '#ffffff',
        disabledColor = '#999999'
    } = options;

    // モーダル表示
    function openModal() {
        openBtn.disabled = true;
        openBtn.style.cursor = 'not-allowed';
        openBtn.style.pointerEvents = 'none';
        openBtn.style.backgroundColor = disabledColor;

        modalEl.style.display = 'flex';
    }

    // モーダル閉じる
    function closeModal() {
        modalEl.style.display = 'none';

        openBtn.disabled = false;
        openBtn.style.cursor = 'pointer';
        openBtn.style.pointerEvents = 'auto';
        openBtn.style.backgroundColor = enabledColor;
    }

    // 閉じるボタン
    closeBtn.addEventListener('click', closeModal);

    // モーダル外クリック
    window.addEventListener('click', (e) => {
        if (e.target === modalEl) closeModal();
    });

    return { openModal, closeModal };
}
