// -------------------- JSON形式検証 --------------------
function validateJsonStructure(json) {
    if (typeof json !== 'object' || json === null) {
        throw new Error('JSON自体がオブジェクトではありません');
    }

    if (!Array.isArray(json.tables) || json.tables.length === 0) {
        throw new Error('tables は配列で、少なくとも1つのテーブルが必要です');
    }

    json.tables.forEach((table, tIndex) => {
        const requiredTableKeys = ["table-logical", "table-physical", "columns"];
        requiredTableKeys.forEach(key => {
            if (!(key in table)) {
                throw new Error(`tables${tIndex + 1} に必須キー ${key} がありません`);
            }
        });

        if (!Array.isArray(table.columns) || table.columns.length === 0) {
            throw new Error(`tables${tIndex + 1}.columns は配列で、少なくとも1つのカラムが必要です`);
        }

        table.columns.forEach((col, cIndex) => {
            const requiredColumnKeys = [
                "column-logical",
                "column-physical",
                "column-key",
                "column-mold",
                "column-default",
                "column-not-null",
                "column-unique",
                "column-auto-increment",
                "column-reference",
                "column-on-delete",
                "column-on-update"
            ];

            // 存在チェック / 型チェック
            requiredColumnKeys.forEach(key => {
                if (!(key in col)) {
                    throw new Error(`tables${tIndex + 1}.columns${cIndex + 1} に必須キー ${key} がありません`);
                }

                if (["column-not-null","column-unique","column-auto-increment"].includes(key)) {
                    if (typeof col[key] !== "boolean") {
                        throw new Error(`tables${tIndex + 1}.columns${cIndex + 1}.${key} は boolean である必要があります`);
                    }
                } else {
                    if (typeof col[key] !== "string") {
                        throw new Error(`tables${tIndex + 1}.columns${cIndex + 1}.${key} は文字列である必要があります`);
                    }
                }
            });
        });
    });

    return true;
}

// -------------------- JSON反映 --------------------
function restoreFromJson(json) {
    const dbView = document.getElementById('db-view');

    // 既存テーブルをすべて削除
    document.querySelectorAll('.table-card').forEach(el => el.remove());

    tableCount = 0;
    columnCount = {};

    json.tables.forEach((table, tIndex) => {
        tableCount++;
        const tableId = `table${tableCount}`;
        columnCount[tableId] = 0;

        // テーブルカード作成
        const tableCard = document.createElement('div');
        tableCard.id = tableId;
        tableCard.className = 'table-card';
        tableCard.dataset.role = 'table';

        // テーブル内部HTMLを生成
        tableCard.innerHTML = createTableHtml(tableId);

        // テーブルカードを add-table の手前に挿入
        dbView.insertBefore(
            tableCard,
            document.querySelector('[data-role="add-table"]')
        );

        // 論理名・物理名反映
        tableCard.querySelector('[data-role="table-logical"] input').value = table["table-logical"];
        tableCard.querySelector('[data-role="table-physical"] input').value = table["table-physical"];

        const wrapper = tableCard.querySelector('[data-role="column-wrapper"]');

        // 最初のカラムを上書き
        const firstCol = table.columns[0];
        const firstColEl = wrapper.querySelector('[data-role="column-row"]');
        setColumnValues(firstColEl, firstCol);
        columnCount[tableId] = 1;

        // カラム2列目以降を追加
        table.columns.slice(1).forEach(col => {
            columnCount[tableId]++;
            wrapper.insertAdjacentHTML(
                'beforeend',
                createColumnRow(tableId, columnCount[tableId])
            );
            const newColEl = wrapper.querySelector(`#${tableId}-column${columnCount[tableId]}-row`);
            setColumnValues(newColEl, col);
        });

        // カラム追加ボタンにイベント
        setupAddColumn(tableId);
    });
}

// -------------------- カラムに値を反映するヘルパー --------------------
function setColumnValues(colEl, colData) {
    const logicalInput = colEl.querySelector('[data-role="column-logical"] input');
    const physicalInput = colEl.querySelector('[data-role="column-physical"] input');
    const keyInput = colEl.querySelector('.col-key .input-col');
    const moldInput = colEl.querySelector('.col-mold .input-col');
    const defaultInput = colEl.querySelector('.col-default input');
    const refInput = colEl.querySelector('.col-reference input');
    const autoChk = colEl.querySelector('.col-constraint[data-role="column-auto-increment"] .chk-col');
    const uniqueChk = colEl.querySelector('.col-constraint[data-role="column-unique"] .chk-col');
    const deleteInput = colEl.querySelector('.col-on-delete input');
    const updateInput = colEl.querySelector('.col-on-update input');

    logicalInput.value = colData["column-logical"];
    physicalInput.value = colData["column-physical"];
    keyInput.value = colData["column-key"];
    moldInput.value = colData["column-mold"];
    defaultInput.value = colData["column-default"];
    refInput.value = colData["column-reference"];
    autoChk.checked = colData["column-auto-increment"];
    uniqueChk.checked = colData["column-unique"];
    deleteInput.value = colData["column-on-delete"];
    updateInput.value = colData["column-on-update"];

    setupRoleInput(colEl);
    setupMoldInput(colEl);
    moldInput.dispatchEvent(new Event('input', { bubbles: true }));
}
