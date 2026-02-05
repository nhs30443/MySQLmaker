/**
 * モーダル共通制御（クラス切り替え方式）
 * @param {HTMLElement} openBtn   モーダルを開いたボタン
 * @param {HTMLElement} modalEl   モーダル要素
 * @param {HTMLElement} closeBtn  閉じるボタン
 */
function setupModal(openBtn, modalEl, closeBtn) {

    // モーダル表示
    function openModal() {
        openBtn.classList.add('disabled');
        modalEl.style.display = 'flex';
    }

    // モーダル閉じる
    function closeModal() {
        openBtn.classList.remove('disabled');
        modalEl.style.display = 'none';
    }

    // 閉じるボタン
    closeBtn.addEventListener('click', closeModal);

    // モーダル外クリック
    window.addEventListener('click', (e) => {
        if (e.target === modalEl) closeModal();
    });

    return { openModal, closeModal };
}
