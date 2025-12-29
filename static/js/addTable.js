let tableCount = 1;
let columnCount = { table1: 1 };

// -------------------- カラムテンプレート --------------------
function createColumnRow(tableId, colNum) {
    return `
        <div id="${tableId}-column${colNum}-row"
             class="column-row"
             data-role="column-row">

            <div id="${tableId}-column${colNum}-logical"
                 class="col-logical"
                 data-role="column-logical">
                <input type="text" class="input-col" placeholder="カラム論理名" />
            </div>

            <div id="${tableId}-column${colNum}-key"
                 class="col-key"
                 data-role="column-key">
                <input type="text" class="input-col" placeholder="PK/FK" />
            </div>

            <div id="${tableId}-column${colNum}-physical"
                 class="col-physical"
                 data-role="column-physical">
                <input type="text" class="input-col" placeholder="column_physical_name" />
            </div>

            <div id="${tableId}-column${colNum}-mold"
                 class="col-mold int"
                 data-role="column-mold">
                <input type="text" class="input-col" placeholder="型" />
            </div>

            <div id="${tableId}-column${colNum}-default"
                 class="col-default"
                 data-role="column-default">
                <input type="text" class="input-col" placeholder="デフォルト値" />
            </div>

            <div class="col-ng" style="display: none"></div>

            <div id="${tableId}-column${colNum}-not-null"
                 class="col-constraint"
                 data-role="column-not-null">
                <label>
                    <input type="checkbox" class="chk-col" /> NOT NULL
                </label>
            </div>

            <div id="${tableId}-column${colNum}-auto-increment"
                 class="col-constraint"
                 data-role="column-auto-increment">
                <label class="auto-increment">
                    <input type="checkbox" class="chk-col" /> AUTO INCREMENT
                </label>
            </div>

            <div class="col-reference" style="display: none" data-role="column-reference">
                <input type="text" class="input-col" placeholder="FK参照先" />
            </div>

            <div id="${tableId}-column${colNum}-unique"
                 class="col-constraint"
                 data-role="column-unique">
                <label>
                    <input type="checkbox" class="chk-col" /> UNIQUE
                </label>
            </div>
        </div>
    `;
}

// -------------------- カラム追加処理 --------------------
function setupAddColumn(tableId) {
    const tableCard = document.getElementById(tableId);
    const addColumnBtn = tableCard.querySelector('[data-role="add-column"]');
    const wrapper = tableCard.querySelector('[data-role="column-wrapper"]');

    // 初回テーブル作成時のカウント
    if (!columnCount[tableId]) columnCount[tableId] = 1;

    addColumnBtn.addEventListener('click', () => {
        columnCount[tableId]++;
        const colNum = columnCount[tableId];

        wrapper.insertAdjacentHTML(
            'beforeend',
            createColumnRow(tableId, colNum)
        );
    });
}

// 初期テーブルに適用
setupAddColumn('table1');

// -------------------- テーブルテンプレート --------------------
function createTableHtml(tableId) {
    return `
        <div id="${tableId}-logical"
             class="table-logical"
             data-role="table-logical">
            <input type="text" class="input-table" placeholder="テーブル論理名" />
        </div>

        <div id="${tableId}-physical"
             class="table-physical"
             data-role="table-physical">
            <input type="text" class="input-table" placeholder="table_physical_name" />
        </div>

        <div id="${tableId}-column-wrapper"
             class="column-wrapper"
             data-role="column-wrapper">
            ${createColumnRow(tableId, 1)}
        </div>

        <div class="add-column"
             data-role="add-column">
            ＋ カラムを追加
        </div>
    `;
}

// -------------------- テーブル追加処理 --------------------
document.querySelector('[data-role="add-table"]').addEventListener('click', () => {
    // テーブル数をインクリメント
    tableCount++;
    const newTableId = `table${tableCount}`;

    // 新しいテーブル用のカラム数を初期化
    columnCount[newTableId] = 1;

    // テーブルカード作成
    const main = document.querySelector('.main');
    const tableCard = document.createElement('div');
    tableCard.id = newTableId;
    tableCard.className = 'table-card';
    tableCard.dataset.role = 'table';

    // テーブル内部HTMLを生成
    tableCard.innerHTML = createTableHtml(newTableId);

    // 「新しいテーブル」ボタンの直前に挿入
    main.insertBefore(
        tableCard,
        document.querySelector('[data-role="add-table"]')
    );

    // 追加したテーブルにカラム追加機能を適用
    setupAddColumn(newTableId);
});
