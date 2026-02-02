const dbBtn = document.getElementById('create-db-btn');

// 仮実行通過後のデータ保持用
let validatedSqlList = null;
let validatedJson = null;

// -------------------- メイン処理 --------------------
function mainHandler() {
    dbBtn.addEventListener('click', () => {
        // ボタン無効化
        dbBtn.disabled = true;
        dbBtn.style.cursor = 'not-allowed';
        dbBtn.style.pointerEvents = 'none';
        dbBtn.style.backgroundColor = '#d0d0d0';

        // -------------------- JSONデータ生成 --------------------
        payload = buildRawJson();
        console.log('JSON', JSON.stringify(payload, null, 2));

        // -------------------- Flaskへ送信 --------------------
        fetch('/api/validate_create_db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(async res => {
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || '不明なエラー');
            }
            return data;
        })
        .then(data => {
            // 仮実行で生成されたデータを保持
            validatedSqlList = data.sql;
            validatedJson = data.json;

            const createDbModalCtrl = setupModal(
                document.getElementById('create-db-btn'),
                document.getElementById('create-db-modal'),
                document.getElementById('close-create-db-modal')
            );

            // モーダル表示
            createDbModalCtrl.openModal();

            // ボタン取得
            const saveJsonBtn = document.getElementById('save-json-btn');
            const saveSqlBtn = document.getElementById('save-sql-btn');
            const cancelCreateDbBtn = document.getElementById('cancel-create-db');
            const createDbForm = document.getElementById('create-db-form');
            const dbNameInput = document.getElementById('db-name-input');

            // -------------------- JSON保存 --------------------
            saveJsonBtn.onclick = () => {
                let dbName = dbNameInput.value.trim();
                if (!dbName) {
                    dbName = 'MySQLmaker_' + getTimestampName();
                }
                handleSaveFile(dbName + '.json', JSON.stringify(normalizeJsonOrder(validatedJson), null, 2));
            };

            // -------------------- SQL保存 --------------------
            saveSqlBtn.onclick = () => {
                let dbName = dbNameInput.value.trim();
                if (!dbName) {
                    dbName = 'MySQLmaker_' + getTimestampName();
                }
                handleSaveFile(dbName + '.sql', validatedSqlList.join('\n\n'));
            };

            // -------------------- キャンセル --------------------
            cancelCreateDbBtn.onclick = () => createDbModalCtrl.closeModal();

            // -------------------- DB作成本実行 --------------------
            createDbForm.onsubmit = async (e) => {
                e.preventDefault();
                const dbName = dbNameInput.value.trim();
                if (!dbName) {
                    showFlashMessage("データベース名を入力してください", "red");
                    return;
                }

                try {
                    const res = await fetch('/api/execute_create_db', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ db_name: dbName, sql: validatedSqlList })
                    });

                    const result = await res.json();
                    if (!res.ok) {
                        throw new Error(result.error || 'DB作成に失敗しました');
                    }

                    showFlashMessage(result.success, "green");
                    createDbModalCtrl.closeModal();

                } catch (err) {
                    console.error(err);
                    showFlashMessage(err.message, "red");
                }
            };
        })
        .catch(err => {
            console.error(err.message);
            showFlashMessage(err.message, "red");
        })
        .finally(() => {
            // ボタン復活
            dbBtn.disabled = false;
            dbBtn.style.cursor = '';
            dbBtn.style.pointerEvents = '';
            dbBtn.style.backgroundColor = '';
        });
    });
}

// -------------------- pywebview と ブラウザ 両対応 --------------------
if (window.pywebview && window.pywebview.api) {
    window.addEventListener('pywebviewready', mainHandler);
} else {
    window.addEventListener('DOMContentLoaded', mainHandler);
}
