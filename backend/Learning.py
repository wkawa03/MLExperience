###############################################################################
# 機能：学習機能
# 概要：リクエストされた学習方法に基づき、機械学習を行う。
###############################################################################
import math
import numpy as np
import psutil

import pytorch_lightning as pl
from pytorch_lightning import Trainer
from pytorch_lightning.callbacks import EarlyStopping

from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_squared_error, log_loss, accuracy_score, precision_score, recall_score, f1_score
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsRegressor, KNeighborsClassifier
from sklearn.svm import SVR, SVC

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader, TensorDataset, random_split
from torchmetrics import Accuracy, Precision, Recall, F1Score

from Define import PROBLEM, MODEL, GetProblem


# 機能：ニューラルネットワーク 学習実行処理
# 概要：ニューラルネットワークによる学習を行う。
def ExecLearning_Nn(df, paramDict):
    # 分析問題取得処理
    problem, uniqueNum = GetProblem(df, paramDict["target"])
    # データローダ取得処理
    numFeatures, trainLoader, valLoader, testLoader = GetDataloader(df, problem, paramDict["target"], paramDict["miniBatch"])
    
    # ニューラルネットワークのモデル定義
    model = Net(numFeatures, paramDict, problem, uniqueNum)
    # Early Stopping設定
    earlyStopCallback = EarlyStopping(monitor="val_loss", min_delta=0.0, patience=5, verbose=True, mode="min")
    
    # 学習実行
    trainer = Trainer(callbacks=[earlyStopCallback], max_epochs=(paramDict["epoch"] - 1), log_every_n_steps=len(trainLoader))
    trainer.fit(model, trainLoader, valLoader)
    
    # テスト実行
    trainer.test(model, testLoader)
    
    # 検証データおよびテストデータのエポック毎の指標を取得
    valMetrics = model.metrics["val"]["epoch"]
    testMetrics = model.metrics["test"]["epoch"]
    
    # 損失値を取得
    valLosses = [round(loss, 2) for loss in valMetrics["losses"]]
    testLoss = round(testMetrics["losses"][0], 2)
    
    # 回帰問題の場合
    if problem == PROBLEM.regression:        
        # 損失値および、ターゲット予測値／正解値を返す
        yPred = [round(pred, 2) for pred in model.yPred]
        yTest = [round(test, 2) for test in model.yTest]
        
        return [valLosses, [], [testLoss], [yPred, yTest]]
    
    # 分類問題の場合
    else:
        # 検証データの各指標を取得
        valAccMax = round(max(valMetrics["accs"]) * 100)
        valPrecMax = round(max(valMetrics["precs"]) * 100)
        valRecMax = round(max(valMetrics["recs"]) * 100)
        valF1Max = round(max(valMetrics["f1s"]) * 100)
        # テストデータの各指標を取得
        testAcc = round(testMetrics["accs"][0] * 100)
        testPrec = round(testMetrics["precs"][0] * 100)
        testRec = round(testMetrics["recs"][0] * 100)
        testF1 = round(testMetrics["f1s"][0] * 100)
        
        # 各指標および、ターゲット予測値／正解値を返す
        return [valLosses,
                [valAccMax, valPrecMax, valRecMax, valF1Max],
                [testLoss, testAcc, testPrec, testRec, testF1],
                [model.yPred, model.yTest]]
    
    
# 機能：データローダ取得処理
# 概要：データローダを取得する。
def GetDataloader(df, problem, target, miniBatch):
    # 入力データを取得
    x = torch.tensor(df.drop(columns=[target]).values, dtype=torch.float32)
    # ターゲットデータを取得
    if problem == PROBLEM.regression:
        t = torch.tensor(df[target].values, dtype=torch.float32)
    else:
        t = torch.tensor(df[target].values, dtype=torch.int64)
    # データセットを取得
    dataset = TensorDataset(x, t)
    # 入力データから特徴数を取得
    numFeatures = x.shape[1]
    
    # データセットを訓練データ・検証データ・テストデータに分割
    torch.manual_seed(0)
    valTestSize = math.floor(len(dataset) * 0.2)
    train, val, test = random_split(dataset, [len(dataset) - (valTestSize * 2), valTestSize, valTestSize])

    # CPU数とGPU数の半数を取得
    num_workers = round((psutil.cpu_count(logical=False) + torch.cuda.device_count()) / 2 + 0.1)

    # データローダを取得
    trainLoader = DataLoader(train, miniBatch, shuffle=True, drop_last=True, num_workers=num_workers, persistent_workers=True)
    valLoader = DataLoader(val, miniBatch, num_workers=num_workers, persistent_workers=True)
    testLoader = DataLoader(test, miniBatch, num_workers=num_workers, persistent_workers=True)
    
    # 特徴数およびデータローダを返す
    return numFeatures, trainLoader, valLoader, testLoader


# 機能：ニューラルネットワーククラス
# 概要：ニューラルネットワークのモデル定義クラス。
class Net(pl.LightningModule):
    # コンストラクタ
    def __init__(self, numFeatures, paramDict, problem, uniqueNum):
        super().__init__()
        
        # 前の層の出力データ数 (初期値は特徴数)
        prevOutputSize = numFeatures
        
        # 各層の設定
        for idx in range(1, 6):
            # 第2層以降かつ、前の層が終了指定されている場合、層(レイヤーおよび活性化関数)を無効化
            if (idx > 1) and (paramDict[f"last{idx - 1}"]):
                setattr(self, f"layer{idx}", lambda x: x)
                setattr(self, f"af{idx}", lambda x: x)
                
            # 有効層の場合
            else:
                # レイヤーを設定
                # 全結合層
                if paramDict[f"layer{idx}"] == "fully":
                    setattr(self, f"layer{idx}", nn.Linear(prevOutputSize, int(paramDict[f"param{idx}"])))
                    # 前の層の出力データ数を現在の層のノーズ数で更新
                    prevOutputSize = int(paramDict[f"param{idx}"])
                    
                # バッチ正規化層
                elif paramDict[f"layer{idx}"] == "batch":
                    setattr(self, f"layer{idx}", nn.BatchNorm1d(prevOutputSize))
                    
                # ドロップアウト層
                else:
                    setattr(self, f"layer{idx}", nn.Dropout(p=float(paramDict[f"param{idx}"])))

                # 活性化関数を設定
                # ReLu
                if paramDict[f"af{idx}"] == "relu":
                    setattr(self, f"af{idx}", F.relu)
                    
                # ハイパボリックタンジェント
                elif paramDict[f"af{idx}"] == "tanh":
                    setattr(self, f"af{idx}", F.tanh)
                
                # なし
                else:
                    setattr(self, f"af{idx}", lambda x: x)

        # 最終層および損失関数を設定
        # 回帰問題
        if problem == PROBLEM.regression:
            self.layerLast = nn.Linear(prevOutputSize, 1)
            self.lf = self.RMSE
            
        # 分類問題
        else:
            self.layerLast = nn.Linear(prevOutputSize, uniqueNum)
            self.lf = F.cross_entropy
        
        # 最適化アルゴリズム・学習率を設定
        self.optimizer = paramDict["optimizer"]
        self.lr = paramDict["lr"]
        # ターゲット予測値／正解値の格納先を定義
        self.yPred = []
        self.yTest = []
        
        # 分類問題の指標算出関数を設定
        # 2値分類
        if uniqueNum == 2:
            self.acc = Accuracy(task="binary")
            self.precision = Precision(task="binary", average="macro")
            self.recall = Recall(task="binary", average="macro")
            self.f1score = F1Score(task="binary", average="macro")
            
        # 多クラス分類
        elif uniqueNum > 2:
            self.acc = Accuracy(task="multiclass", num_classes=uniqueNum)
            self.precision = Precision(task="multiclass", num_classes=uniqueNum, average="macro")
            self.recall = Recall(task="multiclass", num_classes=uniqueNum, average="macro")
            self.f1score = F1Score(task="multiclass", num_classes=uniqueNum, average="macro")
        
        # 指標辞書取得処理
        self.metrics = GetMetricsDict()
        # 分類数を保持
        self.uniqueNum = uniqueNum

    # 二乗平均平方根誤差(RMSE)算出処理
    def RMSE(self, y_pred, y_true):
        return torch.sqrt(F.mse_loss(y_pred, y_true))
        
    # 順伝播処理
    def forward(self, x):
        z = self.af1(self.layer1(x))
        z = self.af2(self.layer2(z))
        z = self.af3(self.layer3(z))
        z = self.af4(self.layer4(z))
        z = self.af5(self.layer5(z))
        return self.layerLast(z)
    
    # ステップ処理
    def ProcStep(self, batch, learnPhase):
        # データ取得
        x, yTest = batch
        # 順伝播処理
        yPred = self(x)
        
        # 損失値を算出
        loss = self.lf(yPred, yTest)
        # ステップ毎の損失値を保存
        metrics = self.metrics[learnPhase]["step"]
        metrics["losses"].append(loss)
        
        # 分類問題の場合、各指標を算出
        if self.uniqueNum >= 2:
            # 2値分類
            if self.uniqueNum == 2:
                yPredArgmax = torch.argmax(yPred, axis=1)
                acc = self.acc(yPredArgmax, yTest)
                prec = self.precision(yPredArgmax, yTest)
                rec = self.recall(yPredArgmax, yTest)
                f1 = self.f1score(yPredArgmax, yTest)
            
            # 多クラス分類
            else:
                acc = self.acc(yPred, yTest)
                prec = self.precision(yPred, yTest)
                rec = self.recall(yPred, yTest)
                f1 = self.f1score(yPred, yTest)
        
            # 各指標を保存
            metrics["accs"].append(acc)
            metrics["precs"].append(prec)
            metrics["recs"].append(rec)
            metrics["f1s"].append(f1)
            
        # テスト中の場合、ターゲット予測値／正解値を保存
        if learnPhase == "test":
            self.yTest.extend(yTest.tolist())
            # 回帰問題の予測値
            if self.uniqueNum < 2:
                self.yPred.extend(yPred.tolist()[0])
            # 分類問題の予測値
            else:
                yPredArgmax = torch.argmax(yPred, axis=1)
                self.yPred.extend(yPredArgmax.tolist())
        
        # モデル最適化のため損失値を返す
        return loss
    
    # エポック処理
    def ProcEpoch(self, learnPhase):
        # 当エポックの損失値の平均値を算出
        stepMetrics = self.metrics[learnPhase]["step"]
        avg_loss = torch.stack(stepMetrics["losses"]).mean()
        
        # エポック毎の損失値を保存
        epochMetrics = self.metrics[learnPhase]["epoch"]
        epochMetrics["losses"].append(avg_loss.item())
        
        # 検証中の場合、損失値を記録
        if learnPhase == "val":
            self.log("val_loss", avg_loss.item())
        
        # 分類問題の場合、各指標を算出し記録
        if self.uniqueNum >= 2:
            avg_acc = torch.stack(stepMetrics["accs"]).mean()
            avg_prec = torch.stack(stepMetrics["precs"]).mean()
            avg_rec = torch.stack(stepMetrics["recs"]).mean()
            avg_f1 = torch.stack(stepMetrics["f1s"]).mean()

            epochMetrics["accs"].append(avg_acc.item())
            epochMetrics["precs"].append(avg_prec.item())
            epochMetrics["recs"].append(avg_rec.item())
            epochMetrics["f1s"].append(avg_f1.item())
        
        # ステップ毎の指標格納辞書をクリア
        stepMetrics = GetMetricsDict_Main()
                 
    # 訓練ステップ処理
    def training_step(self, batch, batch_idx):
        # ステップ処理の結果(損失値)を返す
        return self.ProcStep(batch, "train")
    
    # 訓練エポック処理
    def on_train_epoch_end(self):
        # エポック処理
        self.ProcEpoch("train")
        
    # 検証ステップ処理
    def validation_step(self, batch, batch_idx):
        return self.ProcStep(batch, "val")
    
    # 検証エポック処理
    def on_validation_epoch_end(self):
        self.ProcEpoch("val")
        
    # テストステップ処理
    def test_step(self, batch, batch_idx):
        return self.ProcStep(batch, "test")
    
    # テストエポック処理
    def on_test_epoch_end(self):
        self.ProcEpoch("test")
        
    # 最適化アルゴリズム設定処理
    def configure_optimizers(self):
        # 確率的勾配降下法
        if self.optimizer == "sgd":
            optimizer = torch.optim.SGD(self.parameters(), lr=self.lr)
        # モーメンタム
        elif self.optimizer == "momentum":
            optimizer = torch.optim.SGD(self.parameters(), lr=self.lr, momentum=0.9)
        # RMSprop
        elif self.optimizer == "rmsprop":
            optimizer = torch.optim.RMSprop(self.parameters(), lr=self.lr)
        # Adam
        else:
            optimizer = torch.optim.Adam(self.parameters(), lr=self.lr)

        return optimizer


# 機能：指標辞書取得処理
# 概要：各学習フェーズにおける、指標の格納辞書を取得する。
def GetMetricsDict():
    return {
        "train": GetMetricsDict_Steps(),
        "val": GetMetricsDict_Steps(),
        "test": GetMetricsDict_Steps()
    }


# ステップおよびエポック毎の指標
def GetMetricsDict_Steps():
    return {
        "step": GetMetricsDict_Main(),
        "epoch": GetMetricsDict_Main()
    }


# 各指標のリスト
def GetMetricsDict_Main():
    return {"losses": [], "accs": [], "precs": [], "recs": [], "f1s": []}


# 機能：従来モデル 学習実行処理
# 概要：従来モデルによる学習を行う。
def ExecLearning_Trdt(df, paramDict):
    # 分析問題取得処理
    problem, _ = GetProblem(df, paramDict["target"])

    # ランダムフォレスト
    if paramDict["model"] == MODEL.rf.value:
        # パラメータを設定用に変換
        if paramDict["maxFeatures"] == "none":
            maxFeatures = None
        else:
            maxFeatures = paramDict["maxFeatures"]
            
        if paramDict["maxDepth"] == 0:
            maxDepth = None
        else:
            maxDepth = paramDict["maxDepth"]

        # 回帰問題のモデル定義
        if problem == PROBLEM.regression:
            model = RandomForestRegressor(n_estimators=paramDict["nEstimators"], max_features=maxFeatures,
                                          max_depth=maxDepth, min_samples_split=paramDict["minSamplesSplit"],
                                          random_state=0)
        # 分類問題のモデル定義
        else:
            model = RandomForestClassifier(n_estimators=paramDict["nEstimators"], max_features=maxFeatures,
                                           max_depth=maxDepth, min_samples_split=paramDict["minSamplesSplit"],
                                           random_state=0)
    # サポートベクターマシン
    elif paramDict["model"] == MODEL.svm.value:
        if paramDict["gamma"] == 0:
            gamma = "scale"
        else:
            gamma = paramDict["gamma"]
            
        if problem == PROBLEM.regression:
            model = SVR(kernel=paramDict["kernel"], C=paramDict["c"], gamma=gamma)
        else:
            model = SVC(kernel=paramDict["kernel"], C=paramDict["c"], gamma=gamma, probability=True)
        
    # k近傍法
    else:
        if problem == PROBLEM.regression:
            model = KNeighborsRegressor(n_neighbors=paramDict["nNeighbors"], weights=paramDict["weights"],
                                        algorithm=paramDict["algorithm"], metric=paramDict["metric"])
        else:
            model = KNeighborsClassifier(n_neighbors=paramDict["nNeighbors"], weights=paramDict["weights"],
                                         algorithm=paramDict["algorithm"], metric=paramDict["metric"])
    
    # 予測処理の結果を返す
    return Predict(df, paramDict["target"], model, problem)


# 機能：予測処理
# 概要：モデルの学習とターゲットの予測を行う。
def Predict(df, target, model, problem):
    # 入力データを取得
    x = df.drop(columns=[target]).values
    # ターゲットデータを取得
    y = df[target].values
    # 訓練データとテストデータに分割
    xTrain, xTest, yTrain, yTest = train_test_split(x, y, test_size=0.3, random_state=0)
    
    # 学習実行
    model.fit(xTrain, yTrain)
    
    # 回帰問題の場合
    if problem == PROBLEM.regression:
        # 予測実行
        yPred = model.predict(xTest)
        
        # 損失値および、ターゲット予測値／正解値を返す
        loss = round(math.sqrt(mean_squared_error(yTest, yPred)), 2)
        yPredRes = [round(pred, 2) for pred in yPred.tolist()]
        yTestRes = [round(test, 2) for test in yTest.tolist()]
        
        return [[loss], [yPredRes, yTestRes]]
        
    # 分類問題の場合
    else:
        # 予測実行
        yProba = model.predict_proba(xTest)
        
        # 各指標を算出
        loss = round(log_loss(yTest, yProba, labels=list(range(yProba.shape[1]))), 2)
        
        yProbaArgmax = np.argmax(yProba, axis=1)
        acc = round(accuracy_score(yTest, yProbaArgmax) * 100)
        prec = round(precision_score(yTest, yProbaArgmax, average="macro", zero_division=0.0) * 100)
        rec = round(recall_score(yTest, yProbaArgmax, average="macro", zero_division=0.0) * 100)
        f1 = round(f1_score(yTest, yProbaArgmax, average="macro", zero_division=0.0) * 100)
        
        # 各指標および、ターゲット予測値／正解値を返す
        return [[loss, acc, prec, rec, f1], [yProbaArgmax.tolist(), yTest.tolist()]]
