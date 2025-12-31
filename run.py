from flask import Flask, render_template, redirect, url_for, request, flash, jsonify
import mysql.connector
import requests



### -------------------- 定数定義 --------------------
DEEPL_API_KEY = "95ebf88f-acaf-4649-a9d6-12361cfce17e:fx"

DB_USER = "root"
DB_PASSWORD = "root"


### -------------------- Flask --------------------
app = Flask(__name__)
app.secret_key = "qawsedrftgyhujikolp"


############################################################################
### 関数定義
############################################################################

# MySQL接続
def conn_mySQL():
    conn = mysql.connector.connect(
        host = "127.0.0.1",
        user = DB_USER,
        password = DB_PASSWORD,
        charset = "utf8"
    )
    return conn


# データベース接続
def conn_db(db_name):
    conn = mysql.connector.connect(
        host = "127.0.0.1",
        user = DB_USER,
        password = DB_PASSWORD,
        db = db_name,
        charset = "utf8"
    )
    return conn


# JSON解析関数
def parse_tables(payload):
    # payload から tables を取得
    tables = payload.get('tables')

    # ===== tables を 0 ～ 要素数-1 まで順番に処理 =====
    for t_idx in range(len(tables)):

        # 現在処理中のテーブル情報
        table = tables[t_idx]

        # テーブル論理名・物理名（未入力でもOK）
        table_logical  = table.get('table-logical')
        table_physical = table.get('table-physical')

        print(f'Table[{t_idx}]')
        print(f'table-logical[{table_logical}]')
        print(f'table-physical[{table_physical}]')

        # テーブルに紐づく columns を取得
        columns = table.get('columns')

        # ===== columns を 0 ～ 要素数-1 まで順番に処理 =====
        for c_idx in range(len(columns)):

            # 現在処理中のカラム情報
            column = columns[c_idx]

            # カラムの各属性を取得（空文字・未入力でもOK）
            column_logical = column.get('column-logical')
            column_physical = column.get('column-physical')
            column_key = column.get('column-key')
            column_mold = column.get('column-mold')
            column_default = column.get('column-default')
            column_not_null = column.get('column-not-null')
            column_auto_increment = column.get('column-auto-increment')
            column_unique = column.get('column-unique')
            column_reference = column.get('column-reference')
            
            print(f'column[{c_idx}]')
            print(f'column-logical[{column_logical}]')
            print(f'column-physical[{column_physical}]')
            print(f'column-key[{column_key}]')
            print(f'column-mold[{column_mold}]')
            print(f'column-default[{column_default}]')
            print(f'column-not-null[{column_not_null}]')
            print(f'column-auto-increment[{column_auto_increment}]')
            print(f'column-unique[{column_unique}]')
            print(f'column-reference[{column_reference}]')


############################################################################
### ルート定義
############################################################################

### -------------------- API --------------------
# 翻訳APIプロキシ
@app.route("/api/translate", methods=["POST"])
def api_translate():
    try:
        data = request.get_json(force=True) or {}
        text = data.get("q", "")
        source_lang = data.get("source", "JP")
        target_lang = data.get("target", "EN")
    
        r = requests.post(
            "https://api-free.deepl.com/v2/translate",
            data={
                "auth_key": DEEPL_API_KEY,
                "text": text,
                "source_lang": source_lang.upper(),
                "target_lang": target_lang.upper()
            },
            timeout=10
        )

        # DeepLの応答をテキストで取得
        raw = r.text
        
        # JSONかどうかチェック
        if raw.strip().startswith("<"):
            return jsonify({"error": "DeepLがエラーを返しました"}), 500

        return jsonify(r.json())

    except Exception as e:
        return jsonify({"error": "ネットワークに接続されていません"}), 500
    
    
# DB作成API
@app.route('/api/createDb', methods=['POST'])
def create_db():
    data = request.get_json()
    parse_tables(data)

    return jsonify({"success": "データベースが作成されました"})


# TOP
@app.route('/')
def index():
    return render_template("index.html")


# DB作成ページ
@app.route('/createDB')
def createDB():
    return render_template("createDB.html")


############################################################################
### 実行制御
############################################################################
if __name__ == "__main__":
    app.run(debug=True)