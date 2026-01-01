const dbBtn = document.getElementById('create-db-btn');

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
                "column-key":
                    colEl.querySelector('[data-role="column-key"] input')?.value || "",
                "column-physical":
                    colEl.querySelector('[data-role="column-physical"] input')?.value || "",
                "column-mold":
                    colEl.querySelector('[data-role="column-mold"] input')?.value || "",
                "column-default":
                    colEl.querySelector('[data-role="column-default"] input')?.value || "",
                "column-not-null":
                    colEl.querySelector('[data-role="column-not-null"] input')?.checked || false,
                "column-auto-increment":
                    colEl.querySelector('[data-role="column-auto-increment"] input')?.checked || false,
                "column-unique":
                    colEl.querySelector('[data-role="column-unique"] input')?.checked || false,
                "column-reference":
                    colEl.querySelector('[data-role="column-reference"] input')?.value || ""
            });
        });

        payload.tables.push(table);
    });

    console.log('送信JSON', JSON.stringify(payload, null, 2));

    // -------------------- Flaskへ送信 --------------------
    fetch('/api/createDb', {
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
        console.log('Flask応答:', data);
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
