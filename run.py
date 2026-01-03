from flask import Flask, render_template, redirect, url_for, request, flash, jsonify
import mysql.connector
import requests
import unicodedata
import re



### -------------------- 定数定義 --------------------
DEEPL_API_KEY = "95ebf88f-acaf-4649-a9d6-12361cfce17e:fx"

DB_USER = "root"
DB_PASSWORD = "root"

SQL_RESERVED_WORDS = {
    "accessible", "account", "action", "active", "add", "after", "against",
    "aggregate", "algorithm", "all", "alter", "always", "analyse", "analyze",
    "and", "any", "as", "asc", "asensitive", "before", "between", "bigint",
    "binary", "blob", "both", "by", "call", "cascade", "case", "change",
    "char", "character", "check", "collate", "column", "condition",
    "constraint", "continue", "convert", "create", "cross", "current_date",
    "current_time", "current_timestamp", "database", "databases",
    "day_hour", "day_minute", "day_second", "dec", "decimal", "declare",
    "default", "delayed", "delete", "desc", "describe", "distinct",
    "distinctrow", "drop", "else", "elseif", "end", "enum", "escape",
    "exists", "explain", "false", "fetch", "float", "for", "force", "foreign",
    "from", "fulltext", "grant", "group", "having", "high_priority",
    "hour_minute", "hour_second", "if", "ignore", "index", "inner", "inout",
    "insert", "int", "integer", "interval", "into", "is", "join", "key",
    "keys", "kill", "leading", "left", "like", "limit", "lines", "load",
    "localtime", "localtimestamp", "lock", "long", "longblob", "longtext",
    "loop", "match", "mediumint", "mediumtext", "minute_second", "mod",
    "natural", "not", "now", "null", "numeric", "on", "optimize", "option",
    "or", "order", "outer", "primary", "procedure", "range", "read",
    "references", "regexp", "release", "rename", "repeat", "replace",
    "require", "restrict", "return", "revoke", "right", "rlike", "schema",
    "schemas", "select", "set", "show", "smallint", "soname", "spatial",
    "sql", "sql_big_result", "sql_calc_found_rows", "sql_small_result",
    "ssl", "starting", "straight_join", "table", "terminated", "then",
    "tinyint", "to", "trailing", "trigger", "true", "undo", "union",
    "unique", "unlock", "unsigned", "update", "usage", "use", "using",
    "values", "varbinary", "varchar", "varying", "when", "where",
    "while", "with", "write", "xor", "year_month"
}


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


# テーブルjson解析
def parse_tables(payload):
    # payload から tables を取得
    tables = payload.get('tables')

    # ===== tables を 0 ～ 要素数-1 まで順番に処理 =====
    for t_idx in range(len(tables)):

        # 現在処理中のテーブル情報
        table = tables[t_idx]

        table_logical  = table.get('table-logical')
        table_physical = normalize_physical_name(table.get('table-physical'))
        
        # table_physical が未入力の場合
        if table_physical == "":
            raise ValueError(f"テーブル{t_idx + 1}: テーブル物理名が未入力です")

        # テーブルに紐づく columns を取得
        columns = table.get('columns')

        # ===== columns を 0 ～ 要素数-1 まで順番に処理 =====
        for c_idx in range(len(columns)):

            # 現在処理中のカラム情報
            column = columns[c_idx]

            column_logical = column.get('column-logical')
            column_physical = normalize_physical_name(column.get('column-physical'))
            
            # column_physical が未入力の場合
            if column_physical == "":
                raise ValueError(f"テーブル{t_idx + 1}-カラム{c_idx + 1}: カラム物理名が未入力です")
            
            try:
                column_key = safe_convert(column.get('column-key'), 'column-key')
                column_mold = safe_convert(column.get('column-mold'), 'column-mold')
                column_default = safe_convert(column.get('column-default'), 'column-default')
            except ValueError as e:
                # シングルクォートが閉じていない場合
                raise ValueError(f"テーブル{t_idx + 1}-カラム{c_idx + 1}-{e}")
            
            column_not_null = column.get('column-not-null')
            column_auto_increment = column.get('column-auto-increment')
            column_unique = column.get('column-unique')
            column_reference = column.get('column-reference')
            column_on_delete = column.get('column-on-delete')
            column_on_update = column.get('column-on-update')
            
            # ===== PK処理 =====
            if column_key == "PK":
                pass
            
            # ===== FK処理 =====
            elif column_key == "FK":
                # FK参照先妥当性確認
                try:
                    ref_table, ref_column = parse_column_reference(column_reference, tables)
                except ValueError as e:
                    raise ValueError(f"テーブル{t_idx + 1}-カラム{c_idx + 1}: {e}")
                
            # ===== 通常カラム処理 =====
            else:
                pass
            
    # FK依存関係からSQL実行順を導出
    try:
        execution_order = get_fk_execution_order(tables)
    except ValueError:
        # FKの循環参照エラー
        raise
            

# FK参照先解析
def parse_column_reference(ref_text, tables):
    # table(column) 形式か確認
    match = re.match(r'^([a-zA-Z0-9_]+)\(([a-zA-Z0-9_]+)\)$', ref_text)
    if not match:
        raise ValueError(f"入力形式が不正です")

    ref_table, ref_column = match.groups()
    ref_table = normalize_physical_name(ref_table)
    ref_column = normalize_physical_name(ref_column)

    # table が存在するか確認
    table_physical_list = [normalize_physical_name(t.get('table-physical')) for t in tables]
    if ref_table not in table_physical_list:
        raise ValueError(f"参照テーブルが存在しません")

    # column が存在するか確認
    ref_table_obj = tables[table_physical_list.index(ref_table)]
    column_objs = ref_table_obj.get('columns', [])
    
    # column_physical リストと column_obj を対応付け
    column_dict = {
        normalize_physical_name(c.get('column-physical')): c
        for c in column_objs
    }

    if ref_column not in column_dict:
        raise ValueError(f"参照カラムが存在しません")

    # PK または UNIQUE チェック
    ref_col_obj = column_dict[ref_column]
    col_key = safe_convert(ref_col_obj.get('column-key'), 'column-key')
    col_unique = ref_col_obj.get('column-unique')

    if col_key != "PK" and not col_unique:
        raise ValueError(f"参照カラムは PK または UNIQUE である必要があります")

    # 問題なければテーブル名とカラム名を返す
    return ref_table, ref_column


# FK依存関係からSQL実行順を導出
def get_fk_execution_order(tables):
    # 正規化名一覧
    table_names = [
        normalize_physical_name(t.get('table-physical'))
        for t in tables
    ]

    # 正規化名 → オリジナル名
    original_table_map = {
        normalize_physical_name(t.get('table-physical')): t.get('table-physical')
        for t in tables
    }
    original_column_map = {
        normalize_physical_name(t.get('table-physical')): {
            normalize_physical_name(c.get('column-physical')): c.get('column-physical')
            for c in t.get('columns', [])
        }
        for t in tables
    }

    fk_edges = []

    graph = {name: set() for name in table_names}
    indegree = {name: 0 for name in table_names}

    # ===== FK依存関係収集 =====
    for table in tables:
        fk_table_norm = normalize_physical_name(table.get('table-physical'))
        fk_table_org = table.get('table-physical')

        for column in table.get('columns', []):
            column_key = safe_convert(column.get('column-key'), 'column-key')
            if column_key != "FK":
                continue

            ref_text = column.get('column-reference')
            ref_table_norm, ref_column_norm = parse_column_reference(ref_text, tables)

            from_column_org = column.get('column-physical')
            from_column_norm = normalize_physical_name(from_column_org)
            to_column_org = original_column_map[ref_table_norm][ref_column_norm]

            # 意味のない自己参照は弾く
            if (
                fk_table_norm == ref_table_norm
                and from_column_norm == ref_column_norm
            ):
                raise ValueError(
                    f"意味のない自己参照FKです: "
                    f"{fk_table_org}({from_column_org}) → "
                    f"{fk_table_org}({to_column_org})"
                )

            # FK詳細
            fk_edges.append({
                "from_table": fk_table_org,
                "from_column": from_column_org,
                "to_table": original_table_map[ref_table_norm],
                "to_column": to_column_org
            })

            # 自己参照FKは依存に含めない
            if ref_table_norm == fk_table_norm:
                continue

            if fk_table_norm not in graph[ref_table_norm]:
                graph[ref_table_norm].add(fk_table_norm)
                indegree[fk_table_norm] += 1

    # ===== トポロジカルソート =====
    queue = [t for t in table_names if indegree[t] == 0]
    execution_order = []

    while queue:
        current = queue.pop(0)
        execution_order.append(current)

        for nxt in graph[current]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)

    # ===== 循環参照チェック =====
    if len(execution_order) != len(table_names):
        unresolved_tables = {
            original_table_map[t]
            for t in table_names
            if t not in execution_order
        }

        unresolved_details = [
            f"{e['from_table']}({e['from_column']}) → "
            f"{e['to_table']}({e['to_column']})"
            for e in fk_edges
            if e["from_table"] in unresolved_tables
            and e["from_table"] != e["to_table"]
        ]

        raise ValueError("FKの循環参照が検出されました: " +" / ".join(unresolved_details))

    # 元の物理名で実行順を返す
    return [original_table_map[t] for t in execution_order]


# 安全な変換
def safe_convert(text, field_name):
    try:
        return convert_fullwidth_alpha_to_upper(text)
    except ValueError as e:
        # シングルクォートが閉じていない場合
        raise ValueError(f"{field_name}: {e}")
            
            
# 物理名正規化
def normalize_physical_name(name):
    # 全角英数字・記号を半角に正規化
    name = unicodedata.normalize('NFKC', name)
    # 前後の空白を削除
    name = name.strip()
    # 途中の空白（半角・全角・タブ等）をすべて _ に置換
    name = re.sub(r'\s+', '_', name)
    # 使用可能文字以外を除去（英数字と_のみ残す）
    name = re.sub(r'[^a-zA-Z0-9_]', '', name)
    # 小文字化
    name = name.lower()

    # 先頭文字チェック（数字で始まる場合は _ を付与）
    if name and name[0].isdigit():
        name = "_" + name
    # SQL予約語チェック
    if name.lower() in SQL_RESERVED_WORDS:
        name = name + "_rsv"

    return name


# 全角英字・数字・記号を半角に変換し、英字は大文字にする（'' で囲まれた部分は変更なし）
def convert_fullwidth_alpha_to_upper(text):
    if text is None:
        return ""

    result = []
    in_single_quote = False

    for ch in text:
        # シングルクォートの判定
        if ch == "'":
            in_single_quote = not in_single_quote
            result.append(ch)
            continue
        
        # '' 内は変更なし
        if in_single_quote:
            result.append(ch)
            continue

        code = ord(ch)

        # 全角ASCII文字（英字・数字・記号）
        if 0xFF01 <= code <= 0xFF5E:
            half = chr(code - 0xFEE0)
            # 英字は大文字化
            if 'a' <= half <= 'z' or 'A' <= half <= 'Z':
                result.append(half.upper())
            else:
                result.append(half)
                
        # 半角ASCII文字（英字・数字・記号）
        elif 0x21 <= code <= 0x7E:
            # 英字は大文字化
            if 'a' <= ch <= 'z' or 'A' <= ch <= 'Z':
                result.append(ch.upper())
            else:
                # 数字・記号は保持
                result.append(ch)
                
        # その他（日本語など）
        else:
            continue

    # シングルクォートが閉じていない場合はエラー
    if in_single_quote:
        raise ValueError("シングルクォートが閉じていません")

    return ''.join(result)


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

        # HTTPステータス判定
        if r.status_code in (401, 403):
            return jsonify({"error": "DeepL APIキーが無効です"}), 401

        if r.status_code == 429:
            return jsonify({"error": "DeepL APIの利用制限に達しました"}), 429

        if r.status_code >= 500:
            return jsonify({"error": "DeepL側で障害が発生しています"}), 502

        # レスポンス内容チェック
        raw = r.text

        # HTMLが返った場合
        if raw.strip().startswith("<"):
            return jsonify({"error": "DeepLが不正なレスポンスを返しました"}), 502

        return jsonify(r.json())

    except requests.exceptions.Timeout:
        return jsonify({"error": "DeepLへの接続がタイムアウトしました"}), 504

    except requests.exceptions.RequestException:
        return jsonify({"error": "ネットワークに接続されていません"}), 500

    except Exception:
        return jsonify({"error": "予期せぬエラーが発生しました"}), 500
    
    
# DB作成API
@app.route('/api/createDb', methods=['POST'])
def create_db():
    data = request.get_json()
    
    try:
        parse_tables(data)
    except ValueError as e:
        # エラーがあった場合
        return jsonify({"error": str(e)}), 400

    return jsonify({"success": "データベースが作成されました"})


### -------------------- ページ --------------------
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
