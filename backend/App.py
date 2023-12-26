###############################################################################
# 機能：機械学習簡易体験システム メイン
# 概要：クライアントからのリクエストをWebAPIで受信し、対応する処理を実施する。
###############################################################################
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Optional, Union

import json
import numpy as np
import os
import pandas as pd
from sklearn.preprocessing import LabelEncoder

from Define import FETCH_REQ, MODEL, INPUT_DATA, GetProblem, GetParamDict, GetPreprocDict
from Learning import ExecLearning_Nn, ExecLearning_Trdt
from Optimize import Optimize

# FastAPI設定
load_dotenv("./envVal.env")
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CLIENT_URL")],
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"])


# リクエストクラス
class RequestData(BaseModel):
    req: str
    selectData: str
    arg: Optional[List[Union[str, float, int]]] = None


# レスポンスクラス
class ResponseModel(BaseModel):
    res: str
    arg: List[List[Union[str, float, int]]]


# 機能：WebAPI受信処理
# 概要：クライアントからのWebAPIを受信し、対応する処理を実施する。
@app.post("/api")
def webApi(request: RequestData):
    # 引数が設定されている場合、ターゲットを取得
    if request.arg:
        target = request.arg[0]
    
    # インポート
    if request.req == FETCH_REQ.Import.value:
        try:
            # データフレーム取得処理
            df = GetDataframe(request.selectData)
        except Exception as errMsg:
            return {"res": "error", "arg": errMsg}

        # 欠損値に「None」を設定し(JSONに変換するため)、レスポンスを返す
        df.replace(np.nan, None, inplace=True)
        return {"res": FETCH_REQ.Import.value, "arg": df.values.tolist()}

    # 前処理
    elif request.req == FETCH_REQ.Preproc.value:
        try:
            # 前処理データ取得処理
            df_preproc, preprocCont = GetPreprocData(request.selectData, target)
        except Exception as errMsg:
            return {"res": "error", "arg": errMsg}

        # 分析問題取得処理
        problem, uniqueNum = GetProblem(df_preproc, target)

        # 前処理データの列名・行データ、前処理内容、分析問題をレスポンスで返す
        return {"res": FETCH_REQ.Preproc.value,
                "arg": [df_preproc.columns.tolist(), df_preproc.values.tolist(), preprocCont, [problem, uniqueNum]]}

    # 最適化
    elif request.req == FETCH_REQ.Optimize.value:
        try:
            # 前処理データ取得処理
            df_preproc, _ = GetPreprocData(request.selectData, target)
        except Exception as errMsg:
            return {"res": "error", "arg": errMsg}

        # 引数辞書取得処理
        paramDict = GetParamDict(request.arg, True)
        # 最適化処理
        config = Optimize(df_preproc, paramDict)
        
        # 最適化結果をレスポンスで返す
        return {"res": FETCH_REQ.Optimize.value, "arg": config}
        
    # 学習
    elif request.req == FETCH_REQ.Learning.value:
        try:
            # 前処理データ取得処理
            df_preproc, _ = GetPreprocData(request.selectData, target)
        except Exception as errMsg:
            return {"res": "error", "arg": errMsg}
        
        # パラメータ辞書取得処理
        paramDict = GetParamDict(request.arg, False)
        
        # 学習実行
        if paramDict["model"] == MODEL.nn.value:
            # ニューラルネットワークの場合
            metrics = ExecLearning_Nn(df_preproc, paramDict)
            
        else:
            # ニューラルネットワーク以外の場合
            metrics = ExecLearning_Trdt(df_preproc, paramDict)
        
        # JSON形式に変換できない場合(異常値を含む場合)、エラーをレスポンスで返す
        try:
            json.dumps(metrics, allow_nan=False)
            
        except ValueError:
            return {"res": FETCH_REQ.Learning.value + " ValueError", "arg": []}
        
        # 学習結果の指標をレスポンスで返す
        return {"res": FETCH_REQ.Learning.value, "arg": metrics}
        
    # エラーをレスポンスで返す
    return {"res": "Invalid", "arg": request.req}


# 機能：データフレーム取得処理
# 概要：選択データをDBから取得し、データフレームとして格納する。
def GetDataframe(selectData):
    # DB接続情報を取得
    userName = os.getenv("DB_USERNAME")
    password = os.getenv("DB_PASSWORD")
    host = os.getenv("DB_HOST")
    dbName = os.getenv("DB_NAME")
    
    try:
        # DBから入力データ取得
        engine = create_engine(f"postgresql://{userName}:{password}@{host}/{dbName}")
        df = pd.read_sql_query("SELECT * FROM " + selectData, engine)

    except SQLAlchemyError as errMsg:
        print(f"データベース操作中にエラーが発生しました: {selectData}, {errMsg}")
        
    except Exception as errMsg:
        print(f"予期しないエラーが発生しました: {selectData}, {errMsg}")
        
    finally:
        # DB接続を終了
        engine.dispose()
    
    return df


# 機能：前処理データ取得処理
# 概要：選択データのデータフレームを取得し、ターゲットに基づき前処理を行う。
def GetPreprocData(selectData, target):
    try:
        # データフレーム取得処理
        df = GetDataframe(selectData)
    except Exception as errMsg:
        raise Exception(errMsg)
    
    # 基本前処理
    df, preprocCont = PreprocBasic(selectData, df, target)
    # 特殊前処理
    if selectData == INPUT_DATA.titanic.value:
        df, preprocCont = PreprocExtra(df, target, preprocCont)

    return df, preprocCont


# 機能：基本前処理
# 概要：基本的(汎用的)な前処理を実施する。
def PreprocBasic(selectData, df, target):
    preprocCont = []
    original_columns = df.columns.tolist()
    label_encoder = LabelEncoder()
    
    # 前処理辞書取得処理
    preprocDict = GetPreprocDict(selectData)
    # 前処理辞書の設定を順次処理
    for item in preprocDict:
        # 欠損値の処置が指定されている場合
        if item.get("fillna") is not None:
            # ターゲットが対象列ではないもしくは、ターゲットの欠損値データを削除しない場合
            if (target != item["field"]) or (item.get("targetNotDrop") is not None):
                # 最頻値設定
                if item["fillna"] == "mode":
                    df[item["field"]].fillna(df[item["field"]].mode()[0], inplace=True)
                    # 前処理内容を追加
                    preprocCont.append("・「" + item["headerName"] + "」の欠損値に最頻値を設定しました。")
                    
                # 指定列でグループ化した中央値設定
                elif item["fillna"] == "groupMedian":
                    SetGroupMedian(df, item["field"], item["group"])
                    preprocCont.append("・「" + item["headerName"] + "」の欠損値に「" + item["groupName"] + "」毎にグループ化した中央値を設定しました。")
                    preprocCont.append("　「" + item["groupName"] + "」毎の中央値が設定できない場合、「" + item["headerName"] + "」全体の中央値を設定しました。")
                
                # 指定値を設定
                else:
                    df[item["field"]].fillna(item["fillna"], inplace=True)
                    preprocCont.append("・「" + item["headerName"] + "」の欠損値に「" + str(item["fillna"]) + "」を設定しました。")
            
            # 欠損値を含むデータを削除
            else:
                df.dropna(subset=[item["field"]], inplace=True)
                preprocCont.append("・「" + item["headerName"] + "」が欠損値であるデータを削除しました。")
        
        # 処理内容が指定されていない場合、次の設定へ
        if item.get("proc") is None:
            continue
            
        # 列削除
        if item["proc"] == "drop":
            df.drop(columns=[item["field"]], inplace=True)
            preprocCont.append("・「" + item["headerName"] + "」はターゲットと関係性が低いため削除しました。")
            
        # インデックス値設定
        elif item["proc"] == "index":
            df[item["field"]] = label_encoder.fit_transform(df[item["field"]])
            preprocCont.append("・「" + item["headerName"] + "」をインデックス値に変換しました。")
            
        # ワンホットエンコーディング
        elif item["proc"] == "onehot":
            # ターゲットが対象列ではない場合、ワンホットエンコーディング実施
            if target != item["field"]:
                df = pd.get_dummies(df, columns=[item["field"]])
                # 削除列が指定されている場合、該当列を削除
                if item.get("drop") is not None:
                    df.drop(columns=[item["field"] + "_" + item["drop"]], inplace=True)
                    
                preprocCont.append("・「" + item["headerName"] + "」をワンホットエンコーディングしました。")
                
            # ターゲットが対象列の場合、インデックス値に変換
            else:
                df[item["field"]] = label_encoder.fit_transform(df[item["field"]])
                preprocCont.append("・「" + item["headerName"] + "」をインデックス値に変換しました。")
        
        # ビン分割
        elif item["proc"] == "cut":
            # ターゲットが対象列ではない場合
            if target != item["field"]:
                # ビンに単一整数が指定されている場合、その分位数で分割 (追加列に設定)
                if type(item["bins"]) is int:
                    df[item["field"] + "Bin"] = pd.qcut(df[item["field"]], item["bins"], labels=list(range(item["bins"])))
                # リストが指定されている場合、その範囲で分割
                else:
                    df[item["field"] + "Bin"] = pd.cut(df[item["field"]], bins=item["bins"], labels=item["labels"], include_lowest=True)
                    
                # 指定された前処理内容を追加
                preprocCont.append(item["cont1"])
                if item.get("cont2") is not None:
                    preprocCont.append(item["cont2"])
                if item.get("cont3") is not None:
                    preprocCont.append(item["cont3"])
                
                # 元の列を削除
                df.drop(columns=[item["field"]], inplace=True)
                preprocCont.append("・「" + item["headerName"] + "」を削除しました。")
    
    # 追加列をint型に変換
    new_columns = [col for col in df.columns if col not in original_columns]
    for col in new_columns:
        df[col] = df[col].astype(int)
    
    # 前処理データ、前処理内容を返す
    return df, preprocCont


# 機能：特殊前処理
# 概要：タイタニック号 乗客リスト向けの特殊な前処理を実施する。
def PreprocExtra(df, target, preprocCont):
    original_columns = df.columns.tolist()

    # 「氏名」から「敬称」を抽出 (「年齢」で使用するため、後でワンホットエンコーディング実施)
    df["Title"] = df["Name"].str.extract(r" ([A-Za-z]+)\.", expand=False)
    preprocCont.append("・「氏名」から「敬称」を抽出しました。")
    # 「氏名」を削除
    df.drop(columns=["Name"], inplace=True)
    preprocCont.append("・「氏名」を削除しました。")
    
    # ターゲットが「年齢」ではない場合
    if target != "Age":
        # 「年齢」の欠損値に「敬称」毎にグループ化した中央値を設定
        SetGroupMedian(df, "Age", "Title")
        preprocCont.append("・「年齢」の欠損値に「敬称」毎にグループ化した中央値を設定しました。")
        preprocCont.append("　「敬称」毎の中央値が設定できない場合、「年齢」全体の中央値を設定しました。")
        
        # 「年齢」をビン分割し、列追加
        df["AgeBin"] = pd.cut(df["Age"], bins=[0, 10, 20, 40, 60, float("inf")], labels=[0, 1, 2, 3, 4], include_lowest=True)
        preprocCont.append("・「年齢」を以下に分類し、分類毎のインデックス値として「年齢ビン」列を追加しました。")
        preprocCont.append("　(0～9歳：子ども　10～19歳：10代　20～39歳：大人　40～59歳：中年　60歳～：高年)")
        
        # 元の「年齢」列を削除
        df.drop(columns=["Age"], inplace=True)
        preprocCont.append("・「年齢」を削除しました。")

    # ターゲットが「年齢」の場合、欠損値のデータを削除
    else:
        df.dropna(subset=["Age"], inplace=True)
        preprocCont.append("・「年齢」が欠損値であるデータを削除しました。")
    
    # 「敬称」をワンホットエンコーディング
    df = pd.get_dummies(df, columns=["Title"])
    preprocCont.append("・「敬称」をワンホットエンコーディングしました。")

    # 「自分を含む同乗の家族の人数」列を追加
    if (target != "SibSp") and (target != "Parch"):
        df["FamilySize"] = df["SibSp"] + df["Parch"] + 1
        preprocCont.append("・「自分を含む同乗の家族の人数」列を追加しました。")
        
    # 「客室番号」の先頭文字を抽出し(未設定は「U」とする)、「甲板」列を追加
    df["Cabin"].fillna("U", inplace=True)
    df["Deck"] = df["Cabin"].str[0]
    preprocCont.append("・「客室番号」の先頭文字を抽出し(未設定は「U」とする)、「甲板」列として追加しました。")
    # 「甲板」をワンホットエンコーディング
    df = pd.get_dummies(df, columns=["Deck"])
    preprocCont.append("・「甲板」をワンホットエンコーディングしました。")
    # 「客室番号」を削除
    df.drop(columns=["Cabin"], inplace=True)
    preprocCont.append("・「客室番号」を削除しました。")
    
    # 追加列をint型に変換
    new_columns = [col for col in df.columns if col not in original_columns]
    for col in new_columns:
        df[col] = df[col].astype(int)
        
    # 前処理データ、前処理内容を返す
    return df, preprocCont


# 機能：グループ中値値設定処理
# 概要：対象列の欠損値に、指定されたグループにおける中央値を設定する。
#      グループの中央値が設定できない場合、対象列全体の中央値を設定する。
def SetGroupMedian(df, targetCol, groupCol):
    # グループの中央値を取得
    groupMedians = df.groupby(groupCol)[targetCol].transform("median")
    # 対象列全体の中央値を取得
    overallMedian = df[targetCol].median()

    # 欠損値にグループの中央値を設定。グループの中央値が設定できない場合、対象列全体の中央値を設定
    df[targetCol] = np.where(df[targetCol].isna(),
                             np.where(groupMedians.isna(), overallMedian, groupMedians),
                             df[targetCol])
