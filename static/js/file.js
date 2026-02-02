const fileBtn   = document.getElementById('file-btn');
const fileModal = document.getElementById('file-modal');
const closeBtn  = document.getElementById('close-file-modal');

const loadJsonBtn = document.getElementById('file-load-json-btn');
const saveJsonBtn = document.getElementById('file-save-json-btn');

const dbNameInput = document.getElementById('db-name-input');

const fileModalCtrl = setupModal(fileBtn, fileModal, closeBtn);
fileBtn.addEventListener('click', fileModalCtrl.openModal);

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

        showFlashMessage('JSONを読み込みました', 'green');
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
    } catch (err) {
        console.error(err);
        showFlashMessage(err.message || String(err), "red");
    }
});
