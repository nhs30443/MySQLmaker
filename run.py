from flask import Flask, render_template, redirect, url_for, request, flash
import mysql.connector



DB_USER = "root"
DB_PASSWORD = "root"
DB = "poke1000DB"

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

# TOP
@app.route('/')
def index():
    return render_template("index.html")


# DB作成ページ
@app.route('/makeDB')
def makeDB():
    return render_template("makeDB.html")


############################################################################
### 実行制御
############################################################################
if __name__ == "__main__":
    app.run(debug=True)