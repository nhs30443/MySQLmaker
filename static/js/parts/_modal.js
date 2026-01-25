/**
 * モーダル共通制御
 * @param {HTMLElement} openBtn  モーダルを開いたボタン
 * @param {HTMLElement} modalEl  モーダル要素
 * @param {HTMLElement} closeBtn 閉じるボタン
 */
function setupModal(openBtn, modalEl, closeBtn) {

    // モーダル表示
    function openModal() {
        openBtn.disabled = true;
        openBtn.style.cursor = 'not-allowed';
        openBtn.style.pointerEvents = 'none';
        openBtn.style.backgroundColor = '#999999';

        modalEl.style.display = 'flex';
    }

    // モーダル閉じる
    function closeModal() {
        modalEl.style.display = 'none';

        openBtn.disabled = false;
        openBtn.style.cursor = 'pointer';
        openBtn.style.pointerEvents = 'auto';
        openBtn.style.backgroundColor = '#ffffff';
    }

    // 閉じるボタン
    closeBtn.addEventListener('click', closeModal);

    // モーダル外クリック
    window.addEventListener('click', (e) => {
        if (e.target === modalEl) closeModal();
    });

    return { openModal, closeModal };
}
