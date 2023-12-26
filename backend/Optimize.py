###############################################################################
# 機能：最適化機能
# 概要：モデルのハイパーパラメータ等の設定を最適化する。
###############################################################################
import psutil
import torch

from pytorch_lightning import Trainer
from pytorch_lightning.callbacks import EarlyStopping

import ray
from ray import tune
from ray.tune.schedulers import ASHAScheduler
from ray.tune.search.optuna import OptunaSearch

from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.neighbors import KNeighborsRegressor, KNeighborsClassifier
from sklearn.svm import SVR, SVC

from Define import PROBLEM, MODEL, GetProblem
from Learning import GetDataloader, Net, Predict


# 機能：最適化処理
# 概要：指定されたモデルの最適化を行う。
def Optimize(df, paramDict):
    # 各パラメータの候補値を設定
    config = {}
    # ニューラルネットワーク
    if paramDict["model"] == MODEL.nn.value:
        # 終了層
        config.update({"last": tune.qrandint(1, 5, 1)})
        # 各層のレイヤー、パラメータ、活性化関数
        for idx in range(1, 6):
            config.update({
                f"layer{idx}": tune.choice(["fully", "batch", "dropout"]),
                f"param{idx}": tune.choice([10, 30, 50, 70, 100]),
                f"af{idx}": tune.choice(["relu", "tanh", "none"])})

        # 最適化アルゴリズム
        config.update({"optimizer": tune.choice(["sgd", "momentum", "rmsprop", "adam"])})
        # 学習率
        config.update({"lr": tune.choice([0.001, 0.005, 0.01, 0.05, 0.1])})
        # ミニバッチ数
        config.update({"miniBatch": tune.choice([8, 32, 64, 96])})
        
    # ランダムフォレスト
    elif paramDict["model"] == MODEL.rf.value:
        # 決定木の数
        config.update({"n_estimators": tune.choice([10, 50, 100, 200, 500, 1000])})
        # 特徴量の最大数
        config.update({"max_features": tune.choice(["sqrt", "log2", None])})
        # 決定木の最大深度
        config.update({"max_depth": tune.choice([5, 10, 20, 30, None])})
        # ノード分割の最小サンプル数
        config.update({"min_samples_split": tune.choice([2, 5, 7, 10])})
        
    # サポートベクターマシン
    elif paramDict["model"] == MODEL.svm.value:
        # カーネル
        config.update({"kernel": tune.choice(["rbf", "linear", "poly", "sigmoid"])})
        # C
        config.update({"C": tune.choice([0.1, 1, 10, 100])})
        # gamma
        config.update({"gamma": tune.choice([0.001, 0.01, 0.1, 1, "scale"])})
        
    # k近傍法
    else:
        # 近傍数
        config.update({"n_neighbors": tune.choice([3, 5, 7, 10])})
        # 重み
        config.update({"weights": tune.choice(["uniform", "distance"])})
        # アルゴリズム
        config.update({"algorithm": tune.choice(["auto", "ball_tree", "kd_tree", "brute"])})
        # 距離尺度
        config.update({"metric": tune.choice(["euclidean", "manhattan", "chebyshev"])})
            
    # 学習関数を設定
    if paramDict["model"] == MODEL.nn.value:
        learningFunc = lambda config: LearningFunc_Nn(config, df, paramDict)
        
    else:
        learningFunc = lambda config: LearningFunc_Trdt(config, df, paramDict)
    
    # CPU数・GPU数を取得
    num_cpus = psutil.cpu_count(logical=False)
    num_gpus = torch.cuda.device_count()
    
    # 最適化実行
    ray.init(num_cpus=num_cpus, num_gpus=num_gpus, logging_level="INFO", log_to_driver=True, logging_format="text")
    
    analysis = tune.run(
        learningFunc, config=config, num_samples=50, resources_per_trial={"cpu": num_cpus, "gpu": num_gpus},
        scheduler=ASHAScheduler(metric="loss", mode="min", max_t=50, grace_period=5, reduction_factor=2),
        search_alg=OptunaSearch(metric="loss", mode="min"))
    
    # 最良スコアの設定を取得
    best_config = analysis.get_best_config(metric="loss", mode="min")
    # Rayを終了
    ray.shutdown()
    
    # 最良スコアの設定を返す
    return best_config


# 機能：ニューラルネットワーク 学習関数
# 概要：最適化処理向けのニューラルネットワークの学習処理。
def LearningFunc_Nn(config, df, paramDict):
    # パラメータ辞書を設定
    for idx in range(1, 6):
        # 終了層 (選択された層より前にFalse、以降にTrueを設定)
        if idx < config["last"]:
            paramDict[f"last{idx}"] = False
        else:
            paramDict[f"last{idx}"] = True
        
        # レイヤー
        paramDict[f"layer{idx}"] = config[f"layer{idx}"]
        # パラメータ
        paramDict[f"param{idx}"] = config[f"param{idx}"]
        # レイヤーがドロップアウト層の場合、単位と最大値を変更
        if paramDict[f"layer{idx}"] == "dropout":
            paramDict[f"param{idx}"] /= 100
            if paramDict[f"param{idx}"] == 1:
                paramDict[f"param{idx}"] = 0.99
        
        # 活性化関数
        paramDict[f"af{idx}"] = config[f"af{idx}"]
        
    # 最適化アルゴリズム
    paramDict["optimizer"] = config["optimizer"]
    # 学習率
    paramDict["lr"] = config["lr"]
    
    # 分析問題取得処理
    problem, uniqueNum = GetProblem(df, paramDict["target"])
    # データローダ取得処理
    num_features, train_loader, val_loader, _ = GetDataloader(df, problem, paramDict["target"], config["miniBatch"])
    
    # ニューラルネットワークのモデル定義
    model = Net(num_features, paramDict, problem, uniqueNum)
    # Early Stopping設定
    earlyStopCallback = EarlyStopping(monitor="val_loss", min_delta=0.0, patience=5, verbose=True, mode="min")
    
    # 学習実行
    trainer = Trainer(callbacks=[earlyStopCallback], max_epochs=50)
    trainer.fit(model, train_loader, val_loader)
    # 検証データの損失値を記録
    ray.train.report({"loss": trainer.callback_metrics["val_loss"].item()})


# 機能：従来モデル 学習関数
# 概要：最適化処理向けの従来モデルの学習処理。
def LearningFunc_Trdt(config, df, paramDict):
    # 分析問題取得処理
    problem, uniqueNum = GetProblem(df, paramDict["target"])
    
    # 選択されたパラメータに基づき、モデル定義
    # ランダムフォレスト
    if paramDict["model"] == MODEL.rf.value:
        # 回帰問題
        if problem == PROBLEM.regression:
            model = RandomForestRegressor(
                n_estimators=config["n_estimators"],
                max_features=config["max_features"],
                max_depth=config["max_depth"],
                min_samples_split=config["min_samples_split"],
                random_state=0)
            
        # 分類問題
        else:
            model = RandomForestClassifier(
                n_estimators=config["n_estimators"],
                max_features=config["max_features"],
                max_depth=config["max_depth"],
                min_samples_split=config["min_samples_split"],
                random_state=0)
        
    # サポートベクターマシン
    elif paramDict["model"] == MODEL.svm.value:
        if problem == PROBLEM.regression:
            model = SVR(
                kernel=config["kernel"],
                C=config["C"],
                gamma=config["gamma"],
                random_state=0)
            
        else:
            model = SVC(
                kernel=config["kernel"],
                C=config["C"],
                gamma=config["gamma"],
                probability=True,
                random_state=0)
        
    # k近傍法
    else:
        if problem == PROBLEM.regression:
            model = KNeighborsRegressor(
                n_neighbors=config["n_neighbors"],
                weights=config["weights"],
                algorithm=config["algorithm"],
                metric=config["metric"])
            
        else:
            model = KNeighborsClassifier(
                n_neighbors=config["n_neighbors"],
                weights=config["weights"],
                algorithm=config["algorithm"],
                metric=config["metric"])
    
    # 予測処理
    metrics = Predict(df, paramDict["target"], model, problem, uniqueNum)
    # 損失値を記録
    ray.train.report({"loss": metrics[0][0]})
