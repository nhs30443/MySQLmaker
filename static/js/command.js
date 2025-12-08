const sidebar = document.querySelector('.sidebar');

// コマンドセット
const commands = {
    'table-physical': [
        { text: 'テーブル削除', class: 'red' }
    ],
    'table-logical': [
        { text: '翻訳命名', class: 'green' }
    ],
    'col-physical': [
        { text: 'カラム削除', class: 'red' }
    ],
    'col-logical': [
        { text: '翻訳命名', class: 'green' }
    ],
    'col-key': [
        { text: 'PK', class: 'red' },
        { text: 'FK', class: 'green' }
    ],
    'col-mold': [
        { text: 'INT', class: 'yellow' },
        { text: 'VARCHAR(255)', class: 'red' },
        { text: 'VARCHAR(64)', class: 'red' },
        { text: 'VARCHAR(16)', class: 'red' },
        { text: 'VARCHAR(n)', class: 'red' },
        { text: 'CHAR(4)', class: 'red' },
        { text: 'CHAR(2)', class: 'red' },
        { text: 'CHAR(n)', class: 'red' },
        { text: 'TEXT', class: 'red' },
        { text: 'DATETIME', class: 'green' },
        { text: 'DATE', class: 'green' },
        { text: 'TIME', class: 'green' },
        { text: 'TIMESTAMP', class: 'green' },
        { text: 'TIMESTAMP(2)', class: 'green' },
        { text: 'TIMESTAMP(n)', class: 'green' },
        { text: 'BLOB', class: 'green' },
        { text: 'TINYINT', class: 'yellow' },
        { text: 'SMALLINT', class: 'yellow' },
        { text: 'MEDIUMINT', class: 'yellow' },
        { text: 'INTEGER', class: 'yellow' },
        { text: 'BIGINT', class: 'yellow' },
        { text: 'FLOAT', class: 'yellow' },
        { text: 'DOUBLE', class: 'yellow' },
        { text: 'DECIMAL(10,2)', class: 'yellow' },
        { text: 'DECIMAL(p,s)', class: 'yellow' },
        { text: 'BOOLEAN', class: 'yellow' },
        { text: 'TINYTEXT', class: 'red' },
        { text: 'MEDIUMTEXT', class: 'red' },
        { text: 'LONGTEXT', class: 'red' },
        { text: 'JSON', class: 'green' },
        { text: 'TINYBLOB', class: 'green' },
        { text: 'MEDIUMBLOB', class: 'green' },
        { text: 'LONGBLOB', class: 'green' },
        { text: 'YEAR', class: 'green' },
        { text: 'GEOMETRY', class: 'green' },
        { text: 'POINT', class: 'green' },
        { text: 'LINESTRING', class: 'green' },
        { text: 'POLYGON', class: 'green' },
        { text: 'MULTIPOINT', class: 'green' },
        { text: 'MULTILINESTRING', class: 'green longbtn' },
        { text: 'MULTIPOLYGON', class: 'green longbtn' },
        { text: 'GEOMETRYCOLLECTION', class: 'green longestbtn' },
    ],
    'col-default': [
        { text: 'NULL', class: 'green' },
        { text: '1', class: 'yellow' },
        { text: '0', class: 'yellow' },
        { text: '-1', class: 'yellow' },
        { text: 'TRUE', class: 'yellow' },
        { text: 'FALSE', class: 'yellow' },
        { text: '\'\'', class: 'red' },
        { text: '\'default_text\'', class: 'red' },
        { text: 'CURRENT_DATE', class: 'green longbtn' },
        { text: 'CURRENT_TIME', class: 'green longbtn' },
        { text: 'CURRENT_TIMESTAMP', class: 'green longerbtn' },
        { text: 'CURRENT_TIMESTAMP(2)', class: 'green longestbtn' },
        { text: 'CURRENT_TIMESTAMP(n)', class: 'green longestbtn' },
        { text: 'NOW()', class: 'green' },
        { text: 'CURRENT_YEAR', class: 'green longbtn' },
        { text: '\'1970-01-01\'', class: 'green' },
        { text: '\'00:00:00\'', class: 'green' },
        { text: '\'{}\'', class: 'green' },
        { text: '\'[]\'', class: 'green' },
        { text: 'UUID()', class: 'green' },
        { text: '\'0.0\'', class: 'yellow' },
        { text: '\'1.0\'', class: 'yellow' },
    ]
};

// ボタンを生成
function renderSidebarButtons(btnConfigs) {
    sidebar.innerHTML = '';
    btnConfigs.forEach(cfg => {
        const btn = document.createElement('button');
        btn.className = `btn ${cfg.class || ''}`;
        btn.textContent = cfg.text || '';
        sidebar.appendChild(btn);

        requestAnimationFrame(() => btn.classList.add('show'));
    });
}

// イベント委譲で動的要素にも対応
document.querySelector('.main').addEventListener('focusin', (e) => {
    const target = e.target;
    if (!target.classList.contains('input-table') && !target.classList.contains('input-col')) return;

    const parent = target.parentElement;
    let key = null;

    for (const cls of Object.keys(commands)) {
        if (parent.classList.contains(cls)) {
            key = cls;
            break;
        }
    }

    if (key && commands[key]) {
        renderSidebarButtons(commands[key]);
    } else {
        sidebar.innerHTML = '';
    }
});

document.querySelector('.main').addEventListener('focusout', (e) => {
    const target = e.target;
    if (!target.classList.contains('input-table') && !target.classList.contains('input-col')) return;

    Array.from(sidebar.children).forEach(btn => {
        btn.classList.remove('show');
        setTimeout(() => btn.remove(), 300);
    });
});
