const dbBtn = document.getElementById('create-db-btn');

dbBtn.addEventListener('click', () => {
    // ボタンを無効化
    dbBtn.disabled = true;
    dbBtn.style.cursor = 'not-allowed';
    dbBtn.style.pointerEvents = 'none';
    dbBtn.style.backgroundColor = '#d0d0d0';


    console.log('DB作成ボタンが押されました（処理未定）🌟');
});
