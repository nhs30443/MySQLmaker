from flask import Flask, render_template, redirect, url_for, request, flash, jsonify
import mysql.connector
import requests



### ---------- 定数定義 ---------- ###
DEEPL_API_KEY = "95ebf88f-acaf-4649-a9d6-12361cfce17e:fx"

DB_USER = "root"
DB_PASSWORD = "root"
DB = "poke1000DB"


### ---------- Flask ---------- ###
app = Flask(__name__)
app.secret_key = "qawsedrftgyhujikolp"


############################################################################
### 関数定義
############################################################################

# データベース接続
def conn_db():
    conn = mysql.connector.connect(
        host = "127.0.0.1",
        user = DB_USER,
        password = DB_PASSWORD,
        db = DB,
        charset = "utf8"
    )
    return conn


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

    # デバッグ用
    print(data)

    table = data.get('table', {})
    table_logical = table.get('table-logical')
    table_physical = table.get('table-physical')
    columns = table.get('columns', [])

    # ここでSQL生成やDB作成処理を書く
    # （今は省略）

    return jsonify({
        "status": "ok",
        "table": table_physical,
        "column_count": len(columns)
    })


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