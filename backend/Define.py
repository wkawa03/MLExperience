###############################################################################
# 機能：機械学習簡易体験システム 定義ファイル
# 概要：汎用的な処理や定義を提供する。
###############################################################################
from enum import Enum


# フェッチリクエスト
class FETCH_REQ(Enum):
    Import = "Import"
    Preproc = "Preproc"
    Optimize = "Optimize"
    Learning = "Learning"


# 分析問題
class PROBLEM(Enum):
    regression = "regression"
    classification = "classification"


# 入力データ
class INPUT_DATA(Enum):
    titanic = "titanic"
    lego = "lego"
    house = "house"


# モデル
class MODEL(Enum):
    nn = "nn"
    rf = "rf"
    svm = "svm"
    knn = "knn"


# 機能：分析問題取得処理
# 概要：ターゲットに基づいて問題を判断・取得する。
def GetProblem(df, target):
    # 回帰問題の対象列
    regression = [
        # タイタニック号乗客リスト
        "Age", "SibSp", "Parch", "Fare",
        # レゴブロック
        "Year", "NumInstructions", "Pieces", "Minifigures", "Owned", "Rating", "UsdMsrp", "TotalQuantity", "CurrentPrice",
        # 住宅情報
        "LotFrontage", "LotArea", "YearBuilt", "YearRemodAdd", "MasVnrArea", "BsmtFinSF1", "BsmtFinSF2", "BsmtUnfSF",
        "TotalBsmtSF", "1stFlrSF", "2ndFlrSF", "LowQualFinSF", "GrLivArea", "BsmtFullBath", "BsmtHalfBath", "FullBath",
        "HalfBath", "BedroomAbvGr", "KitchenAbvGr", "TotRmsAbvGrd", "Fireplaces", "GarageYrBlt", "GarageCars",
        "GarageArea", "WoodDeckSF", "OpenPorchSF", "EnclosedPorch", "3SsnPorch", "ScreenPorch", "PoolArea", "MiscVal",
        "MoSold", "YrSold", "SalePrice"]
    
    # 回帰問題の場合
    if target in regression:
        return PROBLEM.regression, 1
    
    # 分類問題の場合 (ユニーク値の数を併せて返す)
    else:
        return PROBLEM.classification, df[target].nunique()


# 機能：前処理辞書取得処理
# 概要：前処理の内容を示す辞書情報を取得する。
#
# field     : 列名
# headerName: 列和名
# fillna    : 欠損値の処置 ("mode": 最頻値, "groupMedian": 指定グループ内の中央値, 左記以外: その値を設定)
#         　    - "groupMedian"指定時パラメータ:: "group": グループ列名 "groupName": グループの和名
# targetNotDrop: fillnaが指定されている際にTrueを指定すると、ターゲット列の場合に欠損値であるデータを削除しない
# proc      : 前処理内容 ("drop": 列削除 "index": インデックス値変換 "cut": ビン分割 "onehot": ワンホットエンコーディング)
#               - "cut"指定時パラメータ:: "bins": 単一整数でその分位数で分割、リストでその範囲で分割
# 　　 　　　　　　　　　　                "labels": "bins"でリスト指定時の各範囲のインデックス値リスト
#               - "onehot"指定時パラメータ:: "drop": 削除する列の分類名
#
def GetPreprocDict(selectData):
    # タイタニック号 乗客リスト
    if selectData == INPUT_DATA.titanic.value:
        return [
            {"field": "PassengerId", "headerName": "乗客ID", "proc": "drop"},
            {"field": "Sex", "headerName": "性別", "proc": "index"},
            {"field": "Ticket", "headerName": "チケット番号", "proc": "drop"},
            {"field": "Fare", "headerName": "運賃", "proc": "cut", "bins": 4,
             "cont1": "・「運賃」を4つのビンに分類し、分類毎のインデックス値として「運賃ビン」列を追加しました。"},
            {"field": "Embarked", "headerName": "乗船港", "fillna": "mode", "proc": "onehot"}]
        
    # レゴブロック
    elif selectData == INPUT_DATA.lego.value:
        return [
            {"field": "SetId", "headerName": "セットID", "proc": "drop"},
            {"field": "Name", "headerName": "商品名", "proc": "drop"},
            
            {"field": "Year", "headerName": "発売年",
             "proc": "cut", "bins": [1970, 1980, 1990, 2000, 2010, float("inf")], "labels": [0, 1, 2, 3, 4],
             "cont1": "・「発売年」を年代に分類し(1970年代、1980年代など)、分類毎のインデックス値として",
             "cont2": "　「発売年ビン」列を追加しました。"},
            
            {"field": "Theme", "headerName": "テーマ", "proc": "index"},
            {"field": "ThemeGroup", "headerName": "テーマグループ", "fillna": "Unknown", "proc": "onehot"},
            {"field": "Subtheme", "headerName": "サブテーマ", "fillna": "Unknown", "proc": "index"},
            {"field": "Category", "headerName": "カテゴリ", "proc": "onehot", "drop": "Normal"},
            {"field": "Packaging", "headerName": "包装", "proc": "onehot", "drop": "{Not specified}"},
            {"field": "Availability", "headerName": "取扱店", "proc": "onehot", "drop": "{Not specified}"},
            
            {"field": "Pieces", "headerName": "ピース数",
             "fillna": "groupMedian", "group": "Theme", "groupName": "テーマ",
             "proc": "cut", "bins": [0, 100, 500, 1000, 2000, float("inf")], "labels": [0, 1, 2, 3, 4],
             "cont1": "・「ピース数」を以下に分類し、分類毎のインデックス値として「ピース数ビン」列を追加しました。",
             "cont2": "　(0～99個、100～499個、500～999個、1000～2999個、3000個～)"},
            
            {"field": "Minifigures", "headerName": "ミニフィギュア数", "fillna": 0, "targetNotDrop": True},
            
            {"field": "Owned", "headerName": "所有数",
             "fillna": "groupMedian", "group": "Theme", "groupName": "テーマ",
             "proc": "cut", "bins": [0, 500, 1000, 5000, 10000, float("inf")], "labels": [0, 1, 2, 3, 4],
             "cont1": "・「所有数」を以下に分類し、分類毎のインデックス値として「所有数ビン」列を追加しました。",
             "cont2": "　(0～499個、500～999個、1000～4999個、5000～9999個、10000個～)"},
            
            {"field": "Rating", "headerName": "評価",
             "proc": "cut", "bins": [0, 1, 2, 3, 4, float("inf")], "labels": [0, 1, 2, 3, 4],
             "cont1": "・「評価」を以下に分類し、分類毎のインデックス値として「評価ビン」列を追加しました。",
             "cont2": "　(0.0～0.9、1.0～1.9、2.0～2.9、3.0～3.9、4.0～)"},
            
            {"field": "UsdMsrp", "headerName": "希望小売価格(USD)",
             "fillna": "groupMedian", "group": "Theme", "groupName": "テーマ",
             "proc": "cut", "bins": [0, 50, 100, 300, 500, float("inf")], "labels": [0, 1, 2, 3, 4],
             "cont1": "・「希望小売価格(USD)」を以下に分類し、分類毎のインデックス値として",
             "cont2": "　「希望小売価格ビン」列を追加しました。",
             "cont3": "　(0.0～49.9、50.0～99.9、100.0～299.9、300.0～499.9、500.0～)"},
            
            {"field": "TotalQuantity", "headerName": "総量", "fillna": 0,
             "proc": "cut", "bins": [0, 50, 100, 200, 300, float("inf")], "labels": [0, 1, 2, 3, 4],
             "cont1": "・「総量」を以下に分類し、分類毎のインデックス値として「総量ビン」列を追加しました。",
             "cont2": "　(0～49、50～99、100～199、200～299、300～)"},
            
            {"field": "CurrentPrice", "headerName": "現在価格(USD)",
             "fillna": "groupMedian", "group": "Theme", "groupName": "テーマ",
             "proc": "cut", "bins": [0, 50, 100, 300, 500, 1000, float("inf")], "labels": [0, 1, 2, 3, 4, 5],
             "cont1": "・「現在価格(USD)」を以下に分類し、分類毎のインデックス値として",
             "cont2": "　「現在価格ビン」列を追加しました。",
             "cont3": "　(0.0～49.9、50.0～99.9、100.0～299.9、300.0～499.9、500.0～999.9、1000.0～)"}
        ]
    
    # 住宅情報
    else:
        return [
            {"field": "HouseId", "headerName": "住宅ID", "proc": "drop"},
            {"field": "MSSubClass", "headerName": "住宅タイプ", "proc": "index"},
            {"field": "MSZoning", "headerName": "区域", "proc": "index"},
            {"field": "LotFrontage", "headerName": "敷地の道路に接する長さ", "fillna": 0},
            {"field": "Street", "headerName": "敷地への道路タイプ", "proc": "index"},
            {"field": "Alley", "headerName": "敷地への路地タイプ", "fillna": "None", "targetNotDrop": True, "proc": "index"},
            {"field": "LotShape", "headerName": "形状", "proc": "index"},
            {"field": "LandContour", "headerName": "敷地の平坦度", "proc": "index"},
            {"field": "Utilities", "headerName": "公共設備", "proc": "index"},
            {"field": "LotConfig", "headerName": "ロット構成", "proc": "index"},
            {"field": "LandSlope", "headerName": "敷地の傾き", "proc": "index"},
            {"field": "Neighborhood", "headerName": "近隣地域", "proc": "index"},
            {"field": "Condition1", "headerName": "条件1", "proc": "index"},
            {"field": "Condition2", "headerName": "条件2", "proc": "index"},
            {"field": "BldgType", "headerName": "住居タイプ", "proc": "index"},
            {"field": "HouseStyle", "headerName": "住居スタイル", "proc": "index"},
            {"field": "RoofStyle", "headerName": "屋根スタイル", "proc": "index"},
            {"field": "RoofMatl", "headerName": "屋根素材", "proc": "index"},
            {"field": "Exterior1st", "headerName": "外装材1", "proc": "index"},
            {"field": "Exterior2nd", "headerName": "外装材2", "proc": "index"},
            {"field": "MasVnrType", "headerName": "石積みベニヤタイプ", "fillna": "None", "targetNotDrop": True, "proc": "index"},
            {"field": "MasVnrArea", "headerName": "石積みベニヤ面積", "fillna": 0, "targetNotDrop": True},
            {"field": "ExterQual", "headerName": "外装品質", "proc": "index"},
            {"field": "ExterCond", "headerName": "外装状態", "proc": "index"},
            {"field": "Foundation", "headerName": "塗材", "proc": "index"},
            {"field": "BsmtQual", "headerName": "地下室品質", "fillna": "None", "targetNotDrop": True, "proc": "index"},
            {"field": "BsmtCond", "headerName": "地下室状態", "fillna": "None", "targetNotDrop": True, "proc": "index"},
            {"field": "BsmtExposure", "headerName": "地下室露出", "fillna": "None", "targetNotDrop": True, "proc": "index"},
            {"field": "BsmtFinType1", "headerName": "地下室タイプ1", "fillna": "None", "targetNotDrop": True, "proc": "index"},
            {"field": "BsmtFinType2", "headerName": "地下室タイプ2", "fillna": "None", "targetNotDrop": True, "proc": "index"},
            {"field": "Heating", "headerName": "暖房", "proc": "index"},
            {"field": "HeatingQC", "headerName": "暖房の品質と状態", "proc": "index"},
            {"field": "CentralAir", "headerName": "空調", "proc": "index"},
            {"field": "Electrical", "headerName": "電気", "fillna": "SBrkr", "proc": "index"},
            {"field": "KitchenQual", "headerName": "キッチン品質", "proc": "index"},
            {"field": "Functional", "headerName": "機能性", "proc": "index"},
            {"field": "FireplaceQu", "headerName": "暖炉品質", "fillna": "None", "targetNotDrop": True, "proc": "index"},
            {"field": "GarageType", "headerName": "ガレージタイプ", "fillna": "None", "targetNotDrop": True, "proc": "index"},
            {"field": "GarageYrBlt", "headerName": "ガレージ建造年", "fillna": 0, "targetNotDrop": True},
            {"field": "GarageFinish", "headerName": "ガレージ仕上げ", "fillna": "None", "targetNotDrop": True, "proc": "index"},
            {"field": "GarageQual", "headerName": "ガレージ品質", "fillna": "None", "targetNotDrop": True, "proc": "index"},
            {"field": "GarageCond", "headerName": "ガレージ状態", "fillna": "None", "targetNotDrop": True, "proc": "index"},
            {"field": "PavedDrive", "headerName": "私道", "proc": "index"},
            {"field": "PoolQC", "headerName": "プールの品質と状態", "fillna": "None", "targetNotDrop": True, "proc": "index"},
            {"field": "Fence", "headerName": "フェンス", "fillna": "None", "targetNotDrop": True, "proc": "index"},
            {"field": "MiscFeature", "headerName": "その他機能", "fillna": "None", "targetNotDrop": True, "proc": "index"},
            {"field": "SaleType", "headerName": "販売タイプ", "proc": "index"},
            {"field": "SaleCondition", "headerName": "販売条件", "proc": "index"}
        ]
        
        
# 機能：パラメータ辞書取得処理
# 概要：リクエストの引数から、各パラメータの辞書情報を取得する。
def GetParamDict(reqArg, optimize):
    config = {
        # ニューラルネットワーク
        MODEL.nn.value: {
            # キー (リクエストの引数の要素順に対応)
            "keys": ["target", "model", "last1", "layer1", "param1", "af1", "last2", "layer2", "param2", "af2",
                     "last3", "layer3", "param3", "af3", "last4", "layer4", "param4", "af4", "last5", "layer5", "param5", "af5",
                     "optimizer", "lr", "miniBatch", "epoch"],
            # 型変換指定 (指定しない場合、文字列型として扱われる)
            "type_conversions": {
                "last1": str_to_bool, "last2": str_to_bool, "last3": str_to_bool, "last4": str_to_bool, "last5": str_to_bool,
                "lr": float, "miniBatch": int, "epoch": int}
        },
        # ランダムフォレスト
        MODEL.rf.value: {
            "keys": ["target", "model", "nEstimators", "maxFeatures", "maxDepth", "minSamplesSplit"],
            "type_conversions": {"nEstimators": int, "maxDepth": int, "minSamplesSplit": int}
        },
        # サポートベクターマシン
        MODEL.svm.value: {
            "keys": ["target", "model", "kernel", "c", "gamma"],
            "type_conversions": {"c": float, "gamma": float}
        },
        # k近傍法
        MODEL.knn.value: {
            "keys": ["target", "model", "nNeighbors", "weights", "algorithm", "metric"],
            "type_conversions": {"nNeighbors": int}
        },
        # 最適化
        FETCH_REQ.Optimize.value: {
            "keys": ["target", "model"],
            "type_conversions": {}
        }
    }
    
    # リクエストが最適化の場合、最適化のコンフィグを使用
    if optimize:
        keys = config[FETCH_REQ.Optimize.value]["keys"]
        type_conversions = config[FETCH_REQ.Optimize.value]["type_conversions"]
    
    # それ以外の場合、リクエストの引数に指定されたモデルのコンフィグを使用
    else:
        model = reqArg[1]
        keys = config[model]["keys"]
        type_conversions = config[model]["type_conversions"]
    
    # 辞書情報を作成
    return {key: (type_conversions[key](reqArg[idx]) if key in type_conversions else reqArg[idx]) for idx, key in enumerate(keys)}
    
    
# 機能：文字列Boolean変換処理
# 概要：文字列のTrue/FalseをBoolean型に変換する。
def str_to_bool(val):
    return (val == "True")
