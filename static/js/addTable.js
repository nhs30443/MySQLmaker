let tableCount = 1;
let columnCount = { table1: 1 };

// カラム追加
function setupAddColumn(tableId) {
    const tableCard = document.getElementById(tableId);
    const addColumnBtn = tableCard.querySelector('.add-column');
    if (!columnCount[tableId]) columnCount[tableId] = 1;

    addColumnBtn.addEventListener('click', () => {
        columnCount[tableId]++;
        const colNum = columnCount[tableId];
        const wrapper = tableCard.querySelector('.column-wrapper');

        const row = document.createElement('div');
        row.id = `${tableId}-column${colNum}-row`;
        row.className = 'column-row';
        row.innerHTML = `
            <div id="${tableId}-column${colNum}-physical" class="col-physical">
                <input type="text" class="input-col" placeholder="カラム物理名" />
            </div>
            <div id="${tableId}-column${colNum}-key" class="col-key">
                <input type="text" class="input-col" placeholder="PK/FK" />
            </div>
            <div id="${tableId}-column${colNum}-logical" class="col-logical">
                <input type="text" class="input-col" placeholder="columnLogicalName" />
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
        `;
        wrapper.appendChild(row);
    });
}

setupAddColumn('table1');

// テーブル追加
document.querySelector('.add-table-btn').addEventListener('click', () => {
    tableCount++;
    const newTableId = `table${tableCount}`;
    columnCount[newTableId] = 1;

    const main = document.querySelector('.main');
    const tableCard = document.createElement('div');
    tableCard.id = newTableId;
    tableCard.className = 'table-card';

    tableCard.innerHTML = `
        <div id="${newTableId}-physical" class="table-physical">
            <input type="text" class="input-table" placeholder="テーブル物理名" />
        </div>
        <div id="${newTableId}-logical" class="table-logical">
            <input type="text" class="input-table" placeholder="table_logical_name" />
        </div>
        <div id="${newTableId}-column-wrapper" class="column-wrapper">
            <div id="${newTableId}-column1-row" class="column-row">
                <div id="${newTableId}-column1-physical" class="col-physical">
                    <input type="text" class="input-col" placeholder="カラム物理名" />
                </div>
                <div id="${newTableId}-column1-key" class="col-key">
                    <input type="text" class="input-col" placeholder="PK/FK" />
                </div>
                <div id="${newTableId}-column1-logical" class="col-logical">
                    <input type="text" class="input-col" placeholder="columnLogicalName" />
                </div>
                <div id="${newTableId}-column1-mold" class="col-mold int">
                    <input type="text" value="INT" class="input-col" placeholder="型" />
                </div>
                <div id="${newTableId}-column1-default" class="col-default">
                    <input type="text" class="input-col" placeholder="デフォルト値" />
                </div>
                <div id="${newTableId}-column1-not-null" class="col-constraint">
                    <label>
                        <input type="checkbox" class="chk-col" /> NOT NULL
                    </label>
                </div>
                <div id="${newTableId}-column1-auto-increment" class="col-constraint">
                    <label class="auto-increment">
                        <input type="checkbox" class="chk-col" /> AUTO INCREMENT
                    </label>
                </div>
                <div id="${newTableId}-column1-unique" class="col-constraint">
                    <label>
                        <input type="checkbox" class="chk-col" /> UNIQUE
                    </label>
                </div>
            </div>
        </div>
        <div class="add-column">＋ カラムを追加</div>
    `;

    main.insertBefore(tableCard, document.querySelector('.add-table-btn'));

    setupAddColumn(newTableId);
});
