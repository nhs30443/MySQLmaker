const dbBtn = document.getElementById('create-db-btn');

// 仮実行通過後のデータ保持用
let validatedSqlList = null;
let validatedJson = null;

dbBtn.addEventListener('click', () => {
    // ボタン無効化
    dbBtn.disabled = true;
    dbBtn.style.cursor = 'not-allowed';
    dbBtn.style.pointerEvents = 'none';
    dbBtn.style.backgroundColor = '#d0d0d0';

    // -------------------- JSONデータ生成 --------------------
    const payload = { tables: [] };

    const tables = document.querySelectorAll('[data-role="table"]');
    console.log('検出テーブル数:', tables.length);

    tables.forEach((tableEl, tIndex) => {

        const logicalInput =
            tableEl.querySelector('[data-role="table-logical"] input');
        const physicalInput =
            tableEl.querySelector('[data-role="table-physical"] input');

        const table = {
            "table-logical": logicalInput ? logicalInput.value : "",
            "table-physical": physicalInput ? physicalInput.value : "",
            "columns": []
        };

        const wrapper = tableEl.querySelector('[data-role="column-wrapper"]');
        if (!wrapper) {
            console.warn(`table[${tIndex}] column-wrapper が見つからない`);
            payload.tables.push(table);
            return;
        }

        const rows = wrapper.querySelectorAll('[data-role="column-row"]');
        console.log(`table[${tIndex}] column-row数:`, rows.length);

        rows.forEach((colEl, cIndex) => {
            table.columns.push({
                "column-logical":
                    colEl.querySelector('[data-role="column-logical"] input')?.value || "",
                "column-physical":
                    colEl.querySelector('[data-role="column-physical"] input')?.value || "",
                "column-key":
                    colEl.querySelector('[data-role="column-key"] input')?.value || "",
                "column-mold":
                    colEl.querySelector('[data-role="column-mold"] input')?.value || "",
                "column-default":
                    colEl.querySelector('[data-role="column-default"] input')?.value || "",
                "column-not-null":
                    colEl.querySelector('[data-role="column-not-null"] input')?.checked || false,
                "column-unique":
                    colEl.querySelector('[data-role="column-unique"] input')?.checked || false,
                "column-auto-increment":
                    colEl.querySelector('[data-role="column-auto-increment"] input')?.checked || false,
                "column-reference":
                    colEl.querySelector('[data-role="column-reference"] input')?.value || "",
                "column-on-delete":
                    colEl.querySelector('[data-role="column-on-delete"] input')?.value || "",
                "column-on-update":
                    colEl.querySelector('[data-role="column-on-update"] input')?.value || "",
            });
        });

        payload.tables.push(table);
    });

    console.log('送信JSON', JSON.stringify(payload, null, 2));

    // -------------------- Flaskへ送信 --------------------
    fetch('/api/validate_create_db', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(async res => {
        const data = await res.json();

        if (!res.ok) {
            // Flaskのエラーメッセージをそのまま使用
            throw new Error(data.error || '不明なエラー');
        }

        return data;
    })
    .then(data => {
        // 仮実行で生成されたデータを保持
        validatedSqlList = data.sql;
        validatedJson = data.json;

        const createDbBtn = document.getElementById('create-db-btn');
        const createDbModal = document.getElementById('create-db-modal');
        const createDbCloseBtn = document.getElementById('close-create-db-modal');

        // モーダル共通制御セット
        const createDbModalCtrl =
            setupModal(createDbBtn, createDbModal, createDbCloseBtn);

        // 表示
        createDbModalCtrl.openModal();

        const saveJsonBtn = document.getElementById('save-json-btn');
        const saveSqlBtn = document.getElementById('save-sql-btn');
        const cancelCreateDbBtn = document.getElementById('cancel-create-db');
        const createDbForm = document.getElementById('create-db-form');
        const dbNameInput = document.getElementById('db-name-input');

        // -------------------- JSON保存 --------------------
        saveJsonBtn.onclick = () => {
            if (!validatedJson) {
                showFlashMessage("保存できるJSONがありません", "red");
                return;
            }

            const blob = new Blob(
                [JSON.stringify(validatedJson, null, 2)],
                { type: 'application/json' }
            );

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'tables.json';
            a.click();
            URL.revokeObjectURL(url);
        };

        // -------------------- SQL保存 --------------------
        saveSqlBtn.onclick = () => {
            if (!validatedSqlList || validatedSqlList.length === 0) {
                showFlashMessage("保存できるSQLがありません", "red");
                return;
            }

            const sqlText = validatedSqlList.join(';\n\n') + ';';

            const blob = new Blob(
                [sqlText],
                { type: 'text/plain' }
            );

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'create_tables.sql';
            a.click();
            URL.revokeObjectURL(url);
        };

        // -------------------- キャンセル --------------------
        cancelCreateDbBtn.onclick = () => {
            createDbModalCtrl.closeModal();
        };

        // -------------------- DB作成本実行 --------------------
        createDbForm.onsubmit = async (e) => {
            e.preventDefault();

            const dbName = dbNameInput.value.trim();
            if (dbName === "") {
                showFlashMessage("データベース名を入力してください", "red");
                return;
            }

            try {
                const res = await fetch('/api/execute_create_db', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        db_name: dbName,
                        sql: validatedSqlList
                    })
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

        // ボタン復活
        dbBtn.disabled = false;
        dbBtn.style.cursor = '';
        dbBtn.style.pointerEvents = '';
        dbBtn.style.backgroundColor = '';
    });
});
