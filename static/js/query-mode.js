// -------------------- クエリモード切替 --------------------
let querySchemaJson = null;
const queryResult = { columns: [], rows: [] };

const queryModeBtn = document.getElementById('query-mode-btn');
const appDb = document.querySelector('.app-db');
const appQuery = document.querySelector('.app-query');
const dbLogToggle = document.getElementById('db-log-toggle');
const createDbBtn = document.getElementById('create-db-btn');
const databaseChangeBtn = document.getElementById('database-change-btn');
const commandSidebar = document.querySelector('.query-cmd-sidebar');
const schemaSidebar = document.querySelector('.query-schema-sidebar');
const queryEditor = document.querySelector('.query-editor');
const queryExecuteBtn = document.getElementById('query-execute-btn');
const queryClearBtn = document.getElementById('query-clear-btn');
const queryResultTable = document.querySelector('.query-result-table');
const queryDbModal = document.getElementById('query-db-modal');
const queryDbForm = document.getElementById('query-db-form');
const queryDbSelect = document.getElementById('query-db-select');
const closeQueryDbModalBtn = document.getElementById('close-query-db-modal');
const cancelQueryDbBtn = document.getElementById('cancel-query-db');
const queryEditorHistory = [];
let queryEditorHistoryIndex = -1;
let isRestoringQueryEditorHistory = false;

const queryCommands = [
    // SELECT
    { text: 'SELECT', color: 'yellow' },
    { text: 'DISTINCT', color: 'yellow' },
    { text: 'AS', color: 'yellow' },
    { text: 'FROM', color: 'yellow' },

    // INSERT
    { text: 'INSERT INTO', color: 'yellow' },
    { text: 'VALUES', color: 'yellow' },

    // UPDATE
    { text: 'UPDATE', color: 'green' },
    { text: 'SET', color: 'green' },

    // DELETE
    { text: 'DELETE FROM', color: 'red' },

    // JOIN
    { text: 'JOIN', color: 'green' },
    { text: 'INNER JOIN', color: 'green' },
    { text: 'LEFT JOIN', color: 'green' },
    { text: 'RIGHT JOIN', color: 'green' },
    { text: 'CROSS JOIN', color: 'green' },
    { text: 'ON', color: 'green' },

    // WHERE
    { text: 'WHERE', color: 'green' },
    { text: 'AND', color: 'green' },
    { text: 'OR', color: 'green' },
    { text: 'NOT', color: 'green' },
    { text: 'IN', color: 'green' },
    { text: 'NOT IN', color: 'green' },
    { text: 'LIKE', color: 'green' },
    { text: 'NOT LIKE', color: 'green' },
    { text: 'BETWEEN', color: 'green' },
    { text: 'NOT BETWEEN', color: 'green' },
    { text: 'IS NULL', color: 'green' },
    { text: 'IS NOT NULL', color: 'green' },
    { text: 'EXISTS', color: 'green' },
    { text: 'NOT EXISTS', color: 'green' },

    // GROUP BY / HAVING
    { text: 'GROUP BY', color: 'yellow' },
    { text: 'HAVING', color: 'yellow' },

    // ORDER BY / LIMIT
    { text: 'ORDER BY', color: 'yellow' },
    { text: 'ASC', color: 'yellow' },
    { text: 'DESC', color: 'yellow' },
    { text: 'LIMIT', color: 'yellow' },

    // 集合演算
    { text: 'UNION', color: 'yellow' },
    { text: 'UNION ALL', color: 'yellow' },
    { text: 'INTERSECT', color: 'yellow' },
    { text: 'EXCEPT', color: 'yellow' },

    // CTE
    { text: 'WITH', color: 'yellow' },

    // CASE
    { text: 'CASE', color: 'green' },
    { text: 'WHEN', color: 'green' },
    { text: 'THEN', color: 'green' },
    { text: 'ELSE', color: 'green' },
    { text: 'END', color: 'green' }
];

const queryFunctions = [
    // 集約関数
    { text: 'COUNT()', color: 'red' },
    { text: 'COUNT(*)', color: 'red', requiresArgument: false },
    { text: 'COUNT(DISTINCT)', color: 'red' },
    { text: 'SUM()', color: 'red' },
    { text: 'AVG()', color: 'red' },
    { text: 'MAX()', color: 'red' },
    { text: 'MIN()', color: 'red' },
    { text: 'GROUP_CONCAT()', color: 'red' },

    // NULL・条件処理
    { text: 'COALESCE()', color: 'red' },
    { text: 'IF()', color: 'red' },
    { text: 'IFNULL()', color: 'red' },
    { text: 'NULLIF()', color: 'red' },

    // 文字列
    { text: 'CONCAT()', color: 'red' },
    { text: 'CONCAT_WS()', color: 'red' },
    { text: 'LOWER()', color: 'red' },
    { text: 'UPPER()', color: 'red' },
    { text: 'TRIM()', color: 'red' },
    { text: 'LENGTH()', color: 'red' },
    { text: 'SUBSTRING()', color: 'red' },

    // 日付・時刻
    { text: 'NOW()', color: 'red', requiresArgument: false },
    { text: 'CURDATE()', color: 'red', requiresArgument: false },
    { text: 'CURTIME()', color: 'red', requiresArgument: false },
    { text: 'YEAR()', color: 'red' },
    { text: 'MONTH()', color: 'red' },
    { text: 'DAY()', color: 'red' },
    { text: 'DATE_FORMAT()', color: 'red' },
    { text: 'DATEDIFF()', color: 'red' },
    { text: 'TIMESTAMPDIFF()', color: 'red' },

    // 数値
    { text: 'ROUND()', color: 'red' },
    { text: 'ABS()', color: 'red' },
    { text: 'CEIL()', color: 'red' },
    { text: 'FLOOR()', color: 'red' },
    { text: 'TRUNCATE()', color: 'red' },

    // ウィンドウ関数
    { text: 'ROW_NUMBER()', color: 'red', requiresArgument: false },
    { text: 'RANK()', color: 'red', requiresArgument: false },
    { text: 'DENSE_RANK()', color: 'red', requiresArgument: false }
];

const querySymbols = [
    // 比較演算子
    { text: '=', color: 'yellow' },
    { text: '!=', color: 'yellow' },
    { text: '<>', color: 'yellow' },
    { text: '>', color: 'yellow' },
    { text: '<', color: 'yellow' },
    { text: '>=', color: 'yellow' },
    { text: '<=', color: 'yellow' },
    { text: '<=>', color: 'yellow' },

    // 文字列
    { text: "''", color: 'red', action: insertQuotedText },
    { text: "'%%'", color: 'red', action: insertLikePattern },

    // 算術演算子
    { text: '+', color: 'yellow' },
    { text: '-', color: 'yellow' },
    { text: '*', color: 'yellow' },
    { text: '/', color: 'yellow' },
    { text: '%', color: 'yellow' }
];

function isQueryMode() {
    return appQuery && !appQuery.hidden;
}

function insertQueryText(text) {
    if (!queryEditor) return;

    const start = queryEditor.selectionStart;
    const end = queryEditor.selectionEnd;
    queryEditor.setRangeText(`${text} `, start, end, 'end');
    queryEditor.focus();
    saveQueryEditorHistory();
}

function insertQueryFunction(text, requiresArgument = true) {
    if (!requiresArgument) {
        insertQueryText(text);
        return;
    }

    insertTextWithCursor(text, text.length - 1);
}

function insertTab() {
    if (!queryEditor) return;

    const start = queryEditor.selectionStart;
    const end = queryEditor.selectionEnd;
    queryEditor.setRangeText('\t', start, end, 'end');
    queryEditor.focus();
    saveQueryEditorHistory();
}

function getQueryEditorState() {
    return {
        value: queryEditor.value,
        selectionStart: queryEditor.selectionStart,
        selectionEnd: queryEditor.selectionEnd
    };
}

function saveQueryEditorHistory() {
    if (!queryEditor || isRestoringQueryEditorHistory) return;

    const state = getQueryEditorState();
    const previousState = queryEditorHistory[queryEditorHistoryIndex];
    if (previousState
        && previousState.value === state.value
        && previousState.selectionStart === state.selectionStart
        && previousState.selectionEnd === state.selectionEnd) {
        return;
    }

    queryEditorHistory.splice(queryEditorHistoryIndex + 1);
    queryEditorHistory.push(state);
    if (queryEditorHistory.length > 100) queryEditorHistory.shift();
    queryEditorHistoryIndex = queryEditorHistory.length - 1;
}

function restoreQueryEditorHistory(index) {
    const state = queryEditorHistory[index];
    if (!state) return;

    isRestoringQueryEditorHistory = true;
    queryEditor.value = state.value;
    queryEditor.setSelectionRange(state.selectionStart, state.selectionEnd);
    queryEditorHistoryIndex = index;
    isRestoringQueryEditorHistory = false;
    queryEditor.focus();
}

function createQueryButton(text, color, action, isFunction = false) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `btn ${color} show`;

    if (isFunction) {
        if (text.length > 11) button.classList.add('longbtn');
        if (text.length > 18) button.classList.add('longerbtn');
    } else {
        if (text.length > 14) button.classList.add('longbtn');
        if (text.length > 18) button.classList.add('longerbtn');
    }

    button.textContent = text;
    button.addEventListener('click', () => (action || insertQueryText)(text));
    return button;
}

function insertParentheses() {
    insertTextWithCursor('()', 1);
}

function insertQuotedText() {
    insertTextWithCursor("''", 1, true);
}

function insertLikePattern() {
    insertTextWithCursor("'%%'", 2, true);
}

function insertTextWithCursor(text, cursorOffset, appendSpace = false) {
    if (!queryEditor) return;

    const start = queryEditor.selectionStart;
    const end = queryEditor.selectionEnd;
    queryEditor.setRangeText(`${text}${appendSpace ? ' ' : ''}`, start, end, 'end');
    queryEditor.setSelectionRange(start + cursorOffset, start + cursorOffset);
    queryEditor.focus();
    saveQueryEditorHistory();
}

function insertComma() {
    if (!queryEditor) return;

    const start = queryEditor.selectionStart;
    const end = queryEditor.selectionEnd;
    const before = queryEditor.value.slice(0, start).replace(/ +$/, '');
    const after = queryEditor.value.slice(end).replace(/^ +/, '');
    queryEditor.value = `${before}, ${after}`;
    queryEditor.setSelectionRange(before.length + 2, before.length + 2);
    queryEditor.focus();
    saveQueryEditorHistory();
}

function insertCommaWithNewline() {
    if (!queryEditor) return;

    const start = queryEditor.selectionStart;
    const end = queryEditor.selectionEnd;
    const before = queryEditor.value.slice(0, start).replace(/ +$/, '');
    const after = queryEditor.value.slice(end).replace(/^ +/, '');
    queryEditor.value = `${before}, \n${after}`;
    queryEditor.setSelectionRange(before.length + 3, before.length + 3);
    queryEditor.focus();
    saveQueryEditorHistory();
}

function insertSemicolon() {
    if (!queryEditor) return;

    const start = queryEditor.selectionStart;
    const end = queryEditor.selectionEnd;
    const before = queryEditor.value.slice(0, start).replace(/ +$/, '');
    const after = queryEditor.value.slice(end).replace(/^ +/, '');
    queryEditor.value = `${before};${after}`;
    queryEditor.setSelectionRange(before.length + 1, before.length + 1);
    queryEditor.focus();
    saveQueryEditorHistory();
}

function insertPeriod() {
    if (!queryEditor) return;

    const start = queryEditor.selectionStart;
    const end = queryEditor.selectionEnd;
    const before = queryEditor.value.slice(0, start).replace(/ +$/, '');
    const after = queryEditor.value.slice(end);
    queryEditor.value = `${before}.${after}`;
    queryEditor.setSelectionRange(before.length + 1, before.length + 1);
    queryEditor.focus();
    saveQueryEditorHistory();
}

function renderCommandPalette() {
    if (!commandSidebar) return;

    commandSidebar.innerHTML = '';
    queryCommands.forEach(({ text, color }) => {
        commandSidebar.appendChild(createQueryButton(text, color));
    });
    querySymbols.forEach(({ text, color, action }) => {
        commandSidebar.appendChild(createQueryButton(text, color, action));
    });
    queryFunctions.forEach(({ text, color, requiresArgument = true }) => {
        commandSidebar.appendChild(createQueryButton(
            text,
            color,
            () => insertQueryFunction(text, requiresArgument),
            true
        ));
    });
}

function renderQueryResult(columns = [], rows = []) {
    if (!queryResultTable) return;

    queryResult.columns = columns;
    queryResult.rows = rows;

    const thead = queryResultTable.querySelector('thead');
    const tbody = queryResultTable.querySelector('tbody');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    const headerRow = document.createElement('tr');
    columns.forEach((column) => {
        const th = document.createElement('th');
        th.textContent = column;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    rows.forEach((row) => {
        const resultRow = document.createElement('tr');
        row.forEach((value) => {
            const td = document.createElement('td');
            td.textContent = value;
            resultRow.appendChild(td);
        });
        tbody.appendChild(resultRow);
    });
}

function renderSchemaPalette(payload) {
    if (!schemaSidebar) return;

    schemaSidebar.innerHTML = '';
    schemaSidebar.appendChild(createQueryButton('*', 'red'));
    schemaSidebar.appendChild(createQueryButton('()', 'red', insertParentheses));
    schemaSidebar.appendChild(createQueryButton(',', 'red', insertComma));
    schemaSidebar.appendChild(createQueryButton(', ↵', 'red', insertCommaWithNewline));
    schemaSidebar.appendChild(createQueryButton('.', 'red', insertPeriod));
    schemaSidebar.appendChild(createQueryButton(';', 'red', insertSemicolon));

    const tables = payload?.tables || [];
    if (tables.length === 0) {
        schemaSidebar.appendChild(createQueryButton('(no tables)', 'yellow'));
        return;
    }

    tables.forEach((table) => {
        const tableName = table['table-physical'] || table['table-logical'] || '(unnamed)';
        schemaSidebar.appendChild(createQueryButton(tableName, 'green'));

        (table.columns || []).forEach((col) => {
            const colName = col['column-physical'] || col['column-logical'] || '';
            if (!colName) return;

            schemaSidebar.appendChild(createQueryButton(colName, 'yellow'));
        });
    });
}

async function enterQueryMode() {
    try {
        await openQueryDatabaseModal();
    } catch (e) {
        showFlashMessage(e.message || 'DB一覧の取得に失敗しました', 'red');
    }
}

async function openQueryDatabaseModal() {
    const res = await fetch('/api/databases');
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'DB一覧の取得に失敗しました');
    }
    if (!data.databases?.length) {
        throw new Error('選択可能なデータベースがありません');
    }

    queryDbSelect.innerHTML = '';
    data.databases.forEach((databaseName) => {
        const option = document.createElement('option');
        option.value = databaseName;
        option.textContent = databaseName;
        option.selected = databaseName === querySchemaJson?.database_name;
        queryDbSelect.appendChild(option);
    });
    queryDbModal.style.display = 'flex';
}

async function selectQueryDatabase(databaseName) {
    const res = await fetch('/api/database_schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ database_name: databaseName })
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'DB構造の取得に失敗しました');
    }

    querySchemaJson = data;
    queryDbModal.style.display = 'none';

    renderSchemaPalette(querySchemaJson);
    renderQueryResult();

    appDb.hidden = true;
    appQuery.hidden = false;

    setFileModalMode(true);

    if (queryModeBtn) queryModeBtn.textContent = 'DB作成モード';
    if (dbLogToggle) dbLogToggle.hidden = false;
    if (databaseChangeBtn) databaseChangeBtn.hidden = false;
    if (createDbBtn) createDbBtn.hidden = true;
    resetLogs();
}

async function executeQuery() {
    const query = queryEditor?.value.trim();
    if (!query) {
        showFlashMessage('クエリを入力してください', 'red');
        return;
    }

    queryExecuteBtn.disabled = true;
    try {
        const res = await fetch('/api/execute_query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                database_name: querySchemaJson.database_name,
                query
            })
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'クエリ実行に失敗しました');
        }

        renderQueryResult(data.columns, data.rows);
        showFlashMessage(data.message || `クエリを実行しました: ${data.rows.length}件取得`, 'green');
    } catch (e) {
        showFlashMessage(e.message || 'クエリ実行に失敗しました', 'red');
    } finally {
        queryExecuteBtn.disabled = false;
    }
}

function enterDbMode() {
    appQuery.hidden = true;
    appDb.hidden = false;

    setFileModalMode(false);

    if (queryModeBtn) queryModeBtn.textContent = 'クエリモード';
    if (dbLogToggle) dbLogToggle.hidden = false;
    if (databaseChangeBtn) databaseChangeBtn.hidden = true;
    if (createDbBtn) createDbBtn.hidden = false;
    resetLogs();
}

function resetLogs() {
    document.getElementById('log-view').textContent = '';
    document.getElementById('query-log-view').textContent = '';
    if (typeof setLogMode === 'function') setLogMode(false);
}

if (queryModeBtn) {
    queryModeBtn.addEventListener('click', async () => {
        if (isQueryMode()) {
            enterDbMode();
        } else {
            queryModeBtn.disabled = true;
            await enterQueryMode();
            queryModeBtn.disabled = false;
        }
    });
}

if (databaseChangeBtn) {
    databaseChangeBtn.addEventListener('click', async () => {
        try {
            await openQueryDatabaseModal();
        } catch (e) {
            showFlashMessage(e.message || 'DB一覧の取得に失敗しました', 'red');
        }
    });
}

if (queryDbForm) {
    queryDbForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await selectQueryDatabase(queryDbSelect.value);
        } catch (e) {
            showFlashMessage(e.message || 'DB構造の取得に失敗しました', 'red');
        }
    });
}

if (closeQueryDbModalBtn) {
    closeQueryDbModalBtn.addEventListener('click', () => {
        queryDbModal.style.display = 'none';
    });
}

if (cancelQueryDbBtn) {
    cancelQueryDbBtn.addEventListener('click', () => {
        queryDbModal.style.display = 'none';
    });
}

if (queryDbModal) {
    queryDbModal.addEventListener('click', (e) => {
        if (e.target === queryDbModal) queryDbModal.style.display = 'none';
    });
}

if (queryExecuteBtn) {
    queryExecuteBtn.addEventListener('click', executeQuery);
}

if (queryClearBtn) {
    queryClearBtn.addEventListener('click', () => {
        queryEditor.value = '';
        renderQueryResult();
        queryEditor.focus();
        saveQueryEditorHistory();
    });
}

if (queryEditor) {
    queryEditor.addEventListener('input', saveQueryEditorHistory);
    queryEditor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            insertTab();
            return;
        }

        if (!e.ctrlKey && !e.metaKey) return;

        if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
            e.preventDefault();
            restoreQueryEditorHistory(queryEditorHistoryIndex - 1);
        }

        if (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey)) {
            e.preventDefault();
            restoreQueryEditorHistory(queryEditorHistoryIndex + 1);
        }
    });
    saveQueryEditorHistory();
}

renderCommandPalette();
renderQueryResult();
