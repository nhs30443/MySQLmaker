// -------------------- トグル --------------------
document.querySelectorAll('.toggle-option').forEach(option => {
  option.addEventListener('click', () => {

    // トグルUI
    document.querySelectorAll('.toggle-option')
      .forEach(o => o.classList.remove('active'));
    option.classList.add('active');

    // 表示切替
    const isLog = option.textContent.trim() === 'ログ';

    document.getElementById('db-view').classList.toggle('active', !isLog);
    document.getElementById('log-view').classList.toggle('active', isLog);

    // ログの時だけ main を切り替える
    const main = document.querySelector('.main');
    main.classList.toggle('log-mode', isLog);

    // サイドバー切替
    if (isLog) {
        // ログモードならログクリアボタンを表示
        renderSidebarButtons(commands['log-clear']);
        currentTarget = null;
    } else {
        // DBモードに戻ったときはアニメーションで消す
        Array.from(sidebar.children).forEach(btn => {
            btn.classList.remove('show');
            setTimeout(() => btn.remove(), 200);
        });
    }
  });
});
