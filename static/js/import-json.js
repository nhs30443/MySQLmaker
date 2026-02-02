// -------------------- json形式検証 --------------------
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
            requiredColumnKeys.forEach(key => {
                if (!(key in col)) {
                    throw new Error(`tables${tIndex + 1}.columns${cIndex + 1} に必須キー ${key} がありません`);
                }
            });

            // 型チェック
            if (typeof col["column-not-null"] !== "boolean") {
                throw new Error(`tables${tIndex + 1}.columns${cIndex + 1}.column-not-null は boolean である必要があります`);
            }
            if (typeof col["column-unique"] !== "boolean") {
                throw new Error(`tables${tIndex + 1}.columns${cIndex + 1}.column-unique は boolean である必要があります`);
            }
            if (typeof col["column-auto-increment"] !== "boolean") {
                throw new Error(`tables${tIndex + 1}.columns${cIndex + 1}.column-auto-increment は boolean である必要があります`);
            }

            // 他のキーは文字列型
            requiredColumnKeys.forEach(key => {
                if (!["column-not-null","column-unique","column-auto-increment"].includes(key)) {
                    if (typeof col[key] !== "string") {
                        throw new Error(`tables${tIndex + 1}.columns${cIndex + 1}.${key} は文字列である必要があります`);
                    }
                }
            });
        });
    });

    return true;
}
