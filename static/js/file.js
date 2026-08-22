const fileBtn   = document.getElementById('file-btn');
const fileModal = document.getElementById('file-modal');
const closeBtn  = document.getElementById('close-file-modal');

const newBtn = document.getElementById('file-new-btn');
const loadJsonBtn = document.getElementById('file-load-json-btn');
const saveJsonBtn = document.getElementById('file-save-json-btn');
const queryFileActions = document.getElementById('query-file-actions');
const querySaveSqlBtn = document.getElementById('query-save-sql-btn');
const querySaveResultBtn = document.getElementById('query-save-result-btn');

const dbNameInput = document.getElementById('db-name-input');

const fileModalCtrl = setupModal(fileBtn, fileModal, closeBtn);
fileBtn.addEventListener('click', fileModalCtrl.openModal);

function setFileModalMode(isQueryMode) {
    fileModal.querySelectorAll(':scope > .modal-content > .modal-sub-actions, :scope > .modal-content > .modal-divider')
        .forEach((element) => {
            if (element !== queryFileActions) element.hidden = isQueryMode;
        });
    queryFileActions.hidden = !isQueryMode;
}

// -------------------- 新規作成 --------------------
newBtn.addEventListener('click', () => {
    const emptyJson = {
        tables: [
            {
                "table-logical": "",
                "table-physical": "",
                "columns": [
                    {
                        "column-logical": "",
                        "column-physical": "",
                        "column-key": "",
                        "column-mold": "",
                        "column-default": "",
                        "column-not-null": false,
                        "column-unique": false,
                        "column-auto-increment": false,
                        "column-reference": "",
                        "column-on-delete": "",
                        "column-on-update": ""
                    }
                ]
            }
        ]
    };
    restoreFromJson(emptyJson);
    showFlashMessage('テーブルをリセットしました', 'green');
    fileModalCtrl.closeModal();
});

// -------------------- JSON読み込み --------------------
loadJsonBtn.addEventListener('click', async () => {
    try {
        const [file] = await new Promise(resolve => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = () => resolve(input.files);
            input.click();
        });

        if (!file) {
            return;
        }

        if (!file.name.endsWith('.json')) {
            showFlashMessage('JSONファイルを選択してください', 'red');
            return;
        }

        const text = await file.text();
        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch {
            showFlashMessage('JSON形式が不正です', 'red');
            return;
        }

        // 検証
        validateJsonStructure(parsed);
        // 反映
        restoreFromJson(parsed);

        showFlashMessage(`${file.name}を読み込みました`, 'green');
        fileModalCtrl.closeModal();
    } catch (err) {
        console.error(err);
        showFlashMessage(err.message || String(err), "red");
    }
});

// -------------------- JSON保存 --------------------
saveJsonBtn.addEventListener('click', () => {
    try {
        // JSON化
        const payload = buildRawJson();
        handleSaveFile('MySQLmaker_tmp_' + getTimestampName() + '.json', JSON.stringify(normalizeJsonOrder(payload), null, 2));
        fileModalCtrl.closeModal();
    } catch (err) {
        console.error(err);
        showFlashMessage(err.message || String(err), "red");
    }
});

// -------------------- クエリモードのファイル保存 --------------------
querySaveSqlBtn.addEventListener('click', () => {
    const query = queryEditor?.value.trim();
    if (!query) {
        showFlashMessage('保存するSQLがありません', 'red');
        return;
    }

    const databaseName = querySchemaJson?.database_name || `MySQLmaker_${getTimestampName()}`;
    handleSaveFile(`${databaseName}.sql`, query);
    fileModalCtrl.closeModal();
});

querySaveResultBtn.addEventListener('click', () => {
    if (!queryResult.columns.length) {
        showFlashMessage('保存するSELECT結果がありません', 'red');
        return;
    }

    const databaseName = querySchemaJson?.database_name || 'MySQLmaker';
    handleSaveBinaryFile(
        `${databaseName}_SELECT_${getTimestampName()}.xlsx`,
        buildQueryResultXlsx(queryResult.columns, queryResult.rows)
    );
    fileModalCtrl.closeModal();
});

function escapeXml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function buildQueryResultXlsx(columns, rows) {
    const encoder = new TextEncoder();
    const createCell = (value, columnIndex, rowIndex, styleIndex) => {
        const columnName = getExcelColumnName(columnIndex + 1);
        const text = escapeXml(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
        return `<c r="${columnName}${rowIndex}" s="${styleIndex}" t="inlineStr"><is><t xml:space="preserve">${text}</t></is></c>`;
    };
    const allRows = [columns, ...rows];
    const columnWidths = columns.map((_, columnIndex) => {
        const maxLength = Math.max(...allRows.map((row) => String(row[columnIndex] ?? '').length));
        return Math.min(Math.max(maxLength + 4, 12), 55);
    });
    const sheetRows = allRows.map((row, rowIndex) => {
        const styleIndex = rowIndex === 0 ? 1 : rowIndex % 2 === 0 ? 3 : 2;
        return `<row r="${rowIndex + 1}" ht="22" customHeight="1">${row.map((value, columnIndex) => createCell(value, columnIndex, rowIndex + 1, styleIndex)).join('')}</row>`;
    }).join('');
    const columnDefinitions = columnWidths.map((width, index) => (
        `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`
    )).join('');
    const files = {
        '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
        '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
        'xl/workbook.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="SELECT結果" sheetId="1" r:id="rId1"/></sheets></workbook>`,
        'xl/_rels/workbook.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
        'xl/styles.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="10"/><name val="Meiryo"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Meiryo"/></font></fonts><fills count="5"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFFFFF"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF5F7FF"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FF192C93"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left/><right style="thin"><color rgb="FFD9D9D9"/></right><top/><bottom style="medium"><color rgb="FF000000"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" indent="1"/></xf><xf numFmtId="0" fontId="1" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="0" fillId="2" borderId="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" indent="1"/></xf><xf numFmtId="0" fontId="0" fillId="3" borderId="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" indent="1"/></xf></cellXfs></styleSheet>`,
        'xl/worksheets/sheet1.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols>${columnDefinitions}</cols><sheetData>${sheetRows}</sheetData></worksheet>`
    };

    return createZip(Object.entries(files).map(([name, content]) => ({ name, data: encoder.encode(content) })));
}

function getExcelColumnName(columnNumber) {
    let name = '';
    while (columnNumber > 0) {
        const remainder = (columnNumber - 1) % 26;
        name = String.fromCharCode(65 + remainder) + name;
        columnNumber = Math.floor((columnNumber - 1) / 26);
    }
    return name;
}

function createZip(files) {
    const encoder = new TextEncoder();
    const localFiles = [];
    const centralDirectory = [];
    let offset = 0;

    files.forEach(({ name, data }) => {
        const nameBytes = encoder.encode(name);
        const crc = calculateCrc32(data);
        const localHeader = new Uint8Array(30 + nameBytes.length);
        const localView = new DataView(localHeader.buffer);
        localView.setUint32(0, 0x04034b50, true);
        localView.setUint16(4, 20, true);
        localView.setUint32(14, crc, true);
        localView.setUint32(18, data.length, true);
        localView.setUint32(22, data.length, true);
        localView.setUint16(26, nameBytes.length, true);
        localHeader.set(nameBytes, 30);
        localFiles.push(localHeader, data);

        const centralHeader = new Uint8Array(46 + nameBytes.length);
        const centralView = new DataView(centralHeader.buffer);
        centralView.setUint32(0, 0x02014b50, true);
        centralView.setUint16(4, 20, true);
        centralView.setUint16(6, 20, true);
        centralView.setUint32(16, crc, true);
        centralView.setUint32(20, data.length, true);
        centralView.setUint32(24, data.length, true);
        centralView.setUint16(28, nameBytes.length, true);
        centralView.setUint32(42, offset, true);
        centralHeader.set(nameBytes, 46);
        centralDirectory.push(centralHeader);
        offset += localHeader.length + data.length;
    });

    const centralDirectorySize = centralDirectory.reduce((size, entry) => size + entry.length, 0);
    const endOfCentralDirectory = new Uint8Array(22);
    const endView = new DataView(endOfCentralDirectory.buffer);
    endView.setUint32(0, 0x06054b50, true);
    endView.setUint16(8, files.length, true);
    endView.setUint16(10, files.length, true);
    endView.setUint32(12, centralDirectorySize, true);
    endView.setUint32(16, offset, true);

    const totalSize = offset + centralDirectorySize + endOfCentralDirectory.length;
    const zip = new Uint8Array(totalSize);
    let position = 0;
    [...localFiles, ...centralDirectory, endOfCentralDirectory].forEach((entry) => {
        zip.set(entry, position);
        position += entry.length;
    });
    return zip;
}

function calculateCrc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) {
        crc ^= byte;
        for (let bit = 0; bit < 8; bit += 1) {
            crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
        }
    }
    return (crc ^ 0xffffffff) >>> 0;
}
