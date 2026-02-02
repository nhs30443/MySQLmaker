// -------------------- テーブル情報をjson化 --------------------
function buildRawJson() {
    const payload = { tables: [] };
    const tables = document.querySelectorAll('[data-role="table"]');

    if (tables.length === 0) {
        throw new Error("テーブルが存在しません");
    }

    tables.forEach((tableEl) => {
        const logicalInput  = tableEl.querySelector('[data-role="table-logical"] input');
        const physicalInput = tableEl.querySelector('[data-role="table-physical"] input');

        const table = {
            "table-logical": logicalInput?.value || "",
            "table-physical": physicalInput?.value || "",
            "columns": []
        };

        const wrapper = tableEl.querySelector('[data-role="column-wrapper"]');
        if (!wrapper) {
            payload.tables.push(table);
            return;
        }

        wrapper.querySelectorAll('[data-role="column-row"]').forEach((colEl) => {
            table.columns.push({
                "column-logical": colEl.querySelector('[data-role="column-logical"] input')?.value || "",
                "column-physical": colEl.querySelector('[data-role="column-physical"] input')?.value || "",
                "column-key": colEl.querySelector('[data-role="column-key"] input')?.value || "",
                "column-mold": colEl.querySelector('[data-role="column-mold"] input')?.value || "",
                "column-default": colEl.querySelector('[data-role="column-default"] input')?.value || "",
                "column-not-null": colEl.querySelector('[data-role="column-not-null"] input')?.checked || false,
                "column-unique": colEl.querySelector('[data-role="column-unique"] input')?.checked || false,
                "column-auto-increment": colEl.querySelector('[data-role="column-auto-increment"] input')?.checked || false,
                "column-reference": colEl.querySelector('[data-role="column-reference"] input')?.value || "",
                "column-on-delete": colEl.querySelector('[data-role="column-on-delete"] input')?.value || "",
                "column-on-update": colEl.querySelector('[data-role="column-on-update"] input')?.value || "",
            });
        });

        payload.tables.push(table);
    });

    return payload;
}

// -------------------- json順序正規化 --------------------
function normalizeJsonOrder(raw) {
    return {
        tables: raw.tables.map(table => ({
            "table-logical": table["table-logical"] ?? "",
            "table-physical": table["table-physical"] ?? "",
            "columns": table.columns.map(col => ({
                "column-logical": col["column-logical"] ?? "",
                "column-physical": col["column-physical"] ?? "",
                "column-key": col["column-key"] ?? "",
                "column-mold": col["column-mold"] ?? "",
                "column-default": col["column-default"] ?? "",
                "column-not-null": !!col["column-not-null"],
                "column-unique": !!col["column-unique"],
                "column-auto-increment": !!col["column-auto-increment"],
                "column-reference": col["column-reference"] ?? "",
                "column-on-delete": col["column-on-delete"] ?? "",
                "column-on-update": col["column-on-update"] ?? ""
            }))
        }))
    };
}

// -------------------- ファイル保存 --------------------
async function handleSaveFile(defaultName, content) {
    if (!content) {
        showFlashMessage("保存可能なデータがありません", "red");
        return;
    }

    try {
        // pywebview環境
        if (window.pywebview && window.pywebview.api) {
            const result = await window.pywebview.api.save_file(defaultName, content);

            if (result === "success") {
                showFlashMessage(`${defaultName}を保存しました`, "green");
            } else if (result === "cancel") {
                // 保存キャンセルされた場合
            } else {
                showFlashMessage(result, "red");
            }

        } else {
            // ブラウザ環境
            const blob = new Blob([content], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = defaultName;
            a.click();
            URL.revokeObjectURL(url);
            showFlashMessage(`${defaultName}を保存しました`, "green");
        }
    } catch (e) {
        showFlashMessage(e.message || String(e), "red");
        console.error(e);
    }
}

// -------------------- タイムスタンプ生成 --------------------
function getTimestampName() {
    const now = new Date();
    return now.getFullYear().toString()
        + String(now.getMonth() + 1).padStart(2, '0')
        + String(now.getDate()).padStart(2, '0')
        + '_'
        + String(now.getHours()).padStart(2, '0')
        + String(now.getMinutes()).padStart(2, '0')
        + String(now.getSeconds()).padStart(2, '0');
}