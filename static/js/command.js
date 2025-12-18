const sidebar = document.querySelector('.sidebar');
let currentTarget = null;

// -------------------- アクション定義 --------------------
// テーブル削除
function deleteTable() {
    if (!currentTarget) return;
    const tableCard = currentTarget.closest('.table-card');
    if (tableCard) tableCard.remove();
}

// カラム削除
function deleteColumn() {
    if (!currentTarget) return;
    const row = currentTarget.closest('.column-row');
    if (row) row.remove();
}

// ボタンの文字をそのままセット
function setTextToTarget(text) {
    if (currentTarget) {
        currentTarget.value = text;

        // inputイベント発火
        currentTarget.dispatchEvent(
            new Event('input', { bubbles: true })
        );
    }
}

// -------------------- 補助関数 --------------------
// 翻訳APIモジュール
window.translate = async function (text, target = "EN") {
    try {
        const res = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                q: text,
                source: "JA",
                target: target
            })
        });

        const data = await res.json();
        
        // エラーの場合にフラッシュメッセージ表示
        if (data.error) {
            showFlashMessage(data.error, "red");
            return;
        }

        return { text: (data.translations && data.translations[0]?.text) || "" };
    } catch (e) {
        console.error("Translation Error:", e);
        return { text: "" };
    }
};

// 翻訳命名処理
async function logicalToPhysical(jpText) {
    const res = await window.translate(jpText, "EN");
    const shortText = simplifyTranslation(res.text);
    return toSnakeCase(shortText);
}

// ()の詳細説明を削除
function simplifyTranslation(text) {
    return text.split("(")[0].trim();
}

// スネークケース変換
function toSnakeCase(str) {
    return str
        .replace(/[\s\-()]+/g, "_")    // 空白・ハイフン・括弧をアンダースコアに
        .replace(/[^\w]+/g, "")        // アルファベット数字以外は除去
        .replace(/__+/g, "_")          // 連続アンダースコアはまとめる
        .replace(/^_|_$/g, "")         // 先頭末尾のアンダースコアを削除
        .toLowerCase();
}

// -------------------- コマンド定義 --------------------
const commands = {
    'table-logical': [
        { text: 'テーブル削除', class: 'red', action: deleteTable }
    ],
    'table-physical': [
        {
            text: '翻訳命名',
            class: 'green',
            action: async () => {
                if (!currentTarget) return;

                // 現在のテーブルカードを取得
                const tableCard = currentTarget.closest('.table-card');
                if (!tableCard) return;

                // 論理名 input と物理名 input を取得
                const logicalInput = tableCard.querySelector('.table-logical .input-table');
                const physicalInput = tableCard.querySelector('.table-physical .input-table');

                if (!logicalInput || !physicalInput) return;

                const jp = logicalInput.value;
                if (!jp.trim()) {
                    logicalInput.value = "";
                    showFlashMessage("翻訳対象がありません", "yellow");
                    return;
                };

                const converted = await logicalToPhysical(jp);
                physicalInput.value = converted;
            }
        }
    ],
    'col-logical': [
        { text: 'カラム削除', class: 'red', action: deleteColumn }
    ],
    'col-physical': [
        {
            text: '翻訳命名',
            class: 'green',
            action: async () => {
                if (!currentTarget) return;

                // 現在のカラム行を取得
                const row = currentTarget.closest('.column-row');
                if (!row) return;

                // 論理名 input と物理名 input を取得
                const logicalInput = row.querySelector('.col-logical .input-col');
                const physicalInput = row.querySelector('.col-physical .input-col');

                if (!logicalInput || !physicalInput) return;

                const jp = logicalInput.value;
                if (!jp.trim()) {
                    logicalInput.value = "";
                    showFlashMessage("翻訳対象がありません", "yellow");
                    return;
                };

                const converted = await logicalToPhysical(jp);
                physicalInput.value = converted;
            }
        }
    ],
    'col-key': [
        { text: 'PK', class: 'red' },
        { text: 'FK', class: 'green' },
        { text: '', class: 'yellow' }
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

// -------------------- ボタン生成 --------------------
function renderSidebarButtons(btnConfigs) {
    sidebar.innerHTML = '';

    btnConfigs.forEach(cfg => {
        const btn = document.createElement('button');
        btn.className = `btn ${cfg.class || ''}`;
        btn.textContent = cfg.text || '';
        sidebar.appendChild(btn);

        // actionがあればセット、無ければinputへ文字反映
        if (cfg.action) {
            btn.onclick = () => cfg.action();
        } else {
            btn.onclick = () => setTextToTarget(cfg.text);
        }

        // 出現アニメーション
        requestAnimationFrame(() => btn.classList.add('show'));
    });
}

// -------------------- 入力フォーカス --------------------
document.querySelector('.main').addEventListener('focusin', (e) => {
    const target = e.target;

    // 入力欄以外は無視
    if (!target.classList.contains('input-table') && !target.classList.contains('input-col')) return;

    currentTarget = target;

    // 親の class からコマンドカテゴリを判定
    const parent = target.parentElement;
    let key = null;

    // parent が持つクラス名の中から commands のキーに一致するものを探して key に入れる
    for (const cls of Object.keys(commands)) {
        if (parent.classList.contains(cls)) {
            key = cls;
            break;
        }
    }

    // 対応するボタンを表示
    if (key) renderSidebarButtons(commands[key]);
    else sidebar.innerHTML = '';
});

document.querySelector('.main').addEventListener('focusout', () => {
    Array.from(sidebar.children).forEach(btn => {
        btn.classList.remove('show');
        setTimeout(() => btn.remove(), 200);
    });
});

// -------------------- カラム入力監視 --------------------
function setupColumnInputObserver(root = document) {
    const rows = root.querySelectorAll('.column-row');

    rows.forEach(row => {
        if (row.dataset.jsInitialized) return;

        setupRoleInput(row);
        setupMoldInput(row);
        row.dataset.jsInitialized = 'true';
    });
}

// PK / FK & AUTO INCREMENT 切替
function setupRoleInput(row) {
    const keyInput = row.querySelector('.col-key .input-col');
    if (!keyInput) return;

    const defaultDiv = row.querySelector('.col-default');
    const ngDiv = row.querySelector('.col-ng');
    const refDiv = row.querySelector('.col-reference');
    const autoDiv = row.querySelector('.col-constraint[data-role="column-auto-increment"]');
    const autoChk = autoDiv ? autoDiv.querySelector('.chk-col') : null;

    function applyState() {
        const value = keyInput.value.trim().toUpperCase();

        row.removeAttribute('data-role');

        if (value === 'PK') {
            row.setAttribute('data-role', 'pk');
            defaultDiv.style.display = 'none';
            ngDiv.style.display = '';
            refDiv.style.display = 'none';
            autoDiv.style.display = '';
        } else if (value === 'FK') {
            row.setAttribute('data-role', 'fk');
            defaultDiv.style.display = '';
            ngDiv.style.display = 'none';
            refDiv.style.display = '';
            autoDiv.style.display = 'none';
        } else {
            row.setAttribute('data-role', '');
            defaultDiv.style.display = '';
            refDiv.style.display = 'none';
            autoDiv.style.display = '';
            if (autoChk.checked) {
                ngDiv.style.display = '';
                defaultDiv.style.display = 'none';
            } else {
                ngDiv.style.display = 'none';
                defaultDiv.style.display = '';
            }
        }
    }

    // 入力変化で反映
    keyInput.addEventListener('input', applyState);
    if (autoChk) {
        autoChk.addEventListener('change', applyState);
    }

    // 初期状態反映
    applyState();
}

// INT / CHAR / OTHER 切替
function setupMoldInput(row) {
    const moldInput = row.querySelector('.col-mold .input-col');
    if (!moldInput) return;

    moldInput.addEventListener('input', () => {
        const value = moldInput.value.trim();
        row.removeAttribute('data-mold');
        if (!value) return;

        const v = value.toUpperCase();

        const moldDef = commands['col-mold'].find(m => {
            const t = m.text.toUpperCase();
            if (/^VARCHAR\(N\)$/.test(t)) return /^VARCHAR\(\d+\)$/.test(v);
            if (/^CHAR\(N\)$/.test(t)) return /^CHAR\(\d+\)$/.test(v);
            if (/^DECIMAL\(P,S\)$/.test(t)) return /^DECIMAL\(\d+,\d+\)$/.test(v);
            if (/^TIMESTAMP\(N\)$/.test(t)) return /^TIMESTAMP\(\d+\)$/.test(v);
            return t === v;
        });

        // class を参照して背景色変更
        const cls = moldDef.class.toLowerCase();
        if (cls.includes('yellow')) row.setAttribute('data-mold', 'int');
        else if (cls.includes('red')) row.setAttribute('data-mold', 'char');
        else if (cls.includes('green')) row.setAttribute('data-mold', 'other');
    });
}

// -------------------- 初期ロード & DOM監視 --------------------
setupColumnInputObserver();

const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (!(node instanceof HTMLElement)) return;

            // table-card が追加された場合
            if (node.classList.contains('table-card')) {
                setupColumnInputObserver(node);
            }

            // column-row が追加された場合
            if (node.classList.contains('column-row')) {
                setupColumnInputObserver(node.parentElement || node);
            }
        });
    });
});

// main配下を監視
observer.observe(document.querySelector('.main'), {
    childList: true,
    subtree: true
});
