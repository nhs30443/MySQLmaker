let tableCount = 1;
let columnCount = { table1: 1 };

// -------------------- カラムテンプレート --------------------
function createColumnRow(tableId, colNum) {
    return `
        <div id="${tableId}-column${colNum}-row" class="column-row">
            <div id="${tableId}-column${colNum}-logical" class="col-logical">
                <input type="text" class="input-col" placeholder="カラム論理名" />
            </div>
            <div id="${tableId}-column${colNum}-key" class="col-key">
                <input type="text" class="input-col" placeholder="PK/FK" />
            </div>
            <div id="${tableId}-column${colNum}-physical" class="col-physical">
                <input type="text" class="input-col" placeholder="column_physical_name" />
            </div>
            <div id="${tableId}-column${colNum}-mold" class="col-mold int">
                <input type="text" value="INT" class="input-col" placeholder="型" />
            </div>
            <div id="${tableId}-column${colNum}-default" class="col-default">
                <input type="text" class="input-col" placeholder="デフォルト値" />
            </div>
            <div id="${tableId}-column${colNum}-not-null" class="col-constraint">
                <label>
                    <input type="checkbox" class="chk-col" /> NOT NULL
                </label>
            </div>
            <div id="${tableId}-column${colNum}-auto-increment" class="col-constraint">
                <label class="auto-increment">
                    <input type="checkbox" class="chk-col" /> AUTO INCREMENT
                </label>
            </div>
            <div id="${tableId}-column${colNum}-unique" class="col-constraint">
                <label>
                    <input type="checkbox" class="chk-col" /> UNIQUE
                </label>
            </div>
        </div>
    `;
}

// カラム追加処理
function setupAddColumn(tableId) {
    const tableCard = document.getElementById(tableId);
    const addColumnBtn = tableCard.querySelector('.add-column');
    const wrapper = tableCard.querySelector('.column-wrapper');

    // 初回テーブル作成時のカウント
    if (!columnCount[tableId]) columnCount[tableId] = 1;

    addColumnBtn.addEventListener('click', () => {
        columnCount[tableId]++;
        const colNum = columnCount[tableId];

        // 新しいカラム行を追加
        wrapper.insertAdjacentHTML(
            'beforeend',
            createColumnRow(tableId, colNum)
        );
    });
}

// table1 にカラム追加機能を適用
setupAddColumn('table1');


// -------------------- テーブルテンプレート --------------------
function createTableHtml(tableId) {
    return `
        <div id="${tableId}-logical" class="table-logical">
            <input type="text" class="input-table" placeholder="テーブル論理名" />
        </div>
        <div id="${tableId}-physical" class="table-physical">
            <input type="text" class="input-table" placeholder="table_physical_name" />
        </div>

        <div id="${tableId}-column-wrapper" class="column-wrapper">
            ${createColumnRow(tableId, 1)}
        </div>

        <div class="add-column">＋ カラムを追加</div>
    `;
}

// テーブル追加処理
document.querySelector('.add-table-btn').addEventListener('click', () => {
    tableCount++;
    const newTableId = `table${tableCount}`;
    columnCount[newTableId] = 1;

    // テーブルカード作成
    const main = document.querySelector('.main');
    const tableCard = document.createElement('div');
    tableCard.id = newTableId;
    tableCard.className = 'table-card';

    tableCard.innerHTML = createTableHtml(newTableId);

    // 追加ボタンの直前に挿入
    main.insertBefore(tableCard, document.querySelector('.add-table-btn'));

    // カラム追加機能を適用
    setupAddColumn(newTableId);
});
