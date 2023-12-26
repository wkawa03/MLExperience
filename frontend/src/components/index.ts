/*****************************************************************************
 * 機能：コンポーネント インデックスファイル
 * 概要：各コンポーネントおよび定義のエクスポートを行う。
 *****************************************************************************/
import { createContext } from "react";

// 共通コンポーネント
export { default as CommonCheckBox } from "./Common/CommonCheckBox";
export { default as CommonSInput } from "./Common/CommonSInput";
export { default as CommonTButton } from "./Common/CommonTButton";
export { default as FetchButton } from "./Common/FetchButton";
export { default as OptimizeDialog } from "./Common/OptimizeDialog";
// 入力データ設定
export { default as SetInputData } from "./SetInputData/SetInputData";
export { default as DataTable } from "./SetInputData/DataTable";
export { default as SelectTarget } from "./SetInputData/SelectTarget";
// モデル設定
export { default as SetModel } from "./SetModel/SetModel";
export { default as SetNn } from "./SetModel/SetNn";
export { default as SetRf } from "./SetModel/SetRf";
export { default as SetSvm } from "./SetModel/SetSvm";
export { default as SetKnn } from "./SetModel/SetKnn";
// 学習実行
export { default as ExecLearning } from "./ExecLearning/ExecLearning";
export { default as LostLineChart } from "./ExecLearning/LostLineChart";

// 共通コンポーネント コンフィグキー
export enum CONFIG_KEY {
    inputData = "inputData", model = "model",
    lastLayer = "lastLayer", layer = "layer", fully = "fully", dropout = "dropout", af = "af",
    optimizer = "optimizer", lr = "lr", miniBatch = "miniBatch", epoch = "epoch",
    nEstimators = "nEstimators", maxFeatures = "maxFeatures", maxDepth = "maxDepth", minSamplesSplit = "minSamplesSplit",
    kernel = "kernel", c = "c", gamma = "gamma",
    nNeighbors = "nNeighbors", weights = "weights", algorithm = "algorithm", metric = "metric"
}

// トグルボタン選択値
export enum INPUT_DATA { titanic = "titanic", lego = "lego", house = "house" }
export enum PROBLEM { regression = "regression", classification = "classification" }
export enum MODEL { nn = "nn", rf = "rf", svm = "svm", knn = "knn" }
export enum LAYER { fully = "fully", batch = "batch", dropout = "dropout" }
export enum AF { relu = "relu", tanh = "tanh", none = "none" }
export enum OPTIMIZER { sgd = "sgd", momentum = "momentum", rmsprop = "rmsprop", adam = "adam" }
export enum MAX_FEATURES { sqrt = "sqrt", log2 = "log2", none = "none" }
export enum KERNEL { rbf = "rbf", linear = "linear", poly = "poly", sigmoid = "sigmoid" }
export enum WEIGHTS { uniform = "uniform", distance = "distance" }
export enum ALGORITHM { auto = "auto", ball_tree = "ball_tree", kd_tree = "kd_tree", brute = "brute" }
export enum METRIC { euclidean = "euclidean", manhattan = "manhattan", chebyshev = "chebyshev" }

// フェッチリクエスト
export const FETCH_REQ = { Import: "Import", Preproc: "Preproc", Optimize: "Optimize", Learning: "Learning" };

// スライダーインプット 最大・最小・デフォルト値
export type SInputValue = { minValue: number; maxValue: number; defValue: number; };
export const SIV_fully: SInputValue = { minValue: 1, maxValue: 100, defValue: 30 };
export const SIV_dropout: SInputValue = { minValue: 0.01, maxValue: 0.99, defValue: 0.5 };
export const SIV_lr: SInputValue = { minValue: 0.001, maxValue: 0.1, defValue: 0.01 };
export const SIV_miniBatch: SInputValue = { minValue: 8, maxValue: 96, defValue: 32 };
export const SIV_epoch: SInputValue = { minValue: 1, maxValue: 200, defValue: 100 };
export const SIV_nEstimators: SInputValue = { minValue: 10, maxValue: 1000, defValue: 100 };
export const SIV_maxDepth: SInputValue = { minValue: 3, maxValue: 30, defValue: 0 };
export const SIV_minSamplesSplit: SInputValue = { minValue: 2, maxValue: 10, defValue: 2 };
export const SIV_c: SInputValue = { minValue: 0.1, maxValue: 100, defValue: 1 };
export const SIV_gamma: SInputValue = { minValue: 0.001, maxValue: 1, defValue: 0 };
export const SIV_nNeighbors: SInputValue = { minValue: 3, maxValue: 10, defValue: 5 };

// ニューラルネットワーク詳細設定 (1層分)
export type NnDetail = { last: boolean; layer: LAYER; param: number; af: AF; };
// ニューラルネットワーク ハイパーパラメータ
export type NnHparam = { lr: number; miniBatch: number; epoch: number; };
// ランダムフォレスト ハイパーパラメータ
export type RfHparam = { nEstimators: number; maxFeatures: MAX_FEATURES; maxDepth: number; minSamplesSplit: number; };
// サポートベクターマシン ハイパーパラメータ
export type SvmHparam = { kernel: KERNEL; c: number; gamma: number; };
// k近傍法 ハイパーパラメータ
export type KnnHparam = { nNeighbors: number; weights: WEIGHTS; algorithm: ALGORITHM; metric: METRIC; };

// 共通コンテキスト
export const CommonContext = createContext({
    selectData: INPUT_DATA.titanic,
    SetSelectData: (value: INPUT_DATA) => {},
    target: "",
    SetTarget: (value: string) => {},
    problem: [PROBLEM.regression, 1],
    SetProblem: (value: (PROBLEM | number)[]) => {},
    waitFetch: "",
    SetWaitFetch: (value: string) => {},
    fetchError: "",
    SetFetchError: (value: string) => {},
});
// モデル設定コンテキスト
export const ModelContext = createContext({
    model: MODEL.nn,
    SetModelVal: (value: MODEL) => {},
    nnDetails: [
        { last: false, layer: LAYER.batch, param: 0, af: AF.relu },
        { last: false, layer: LAYER.fully, param: SIV_fully.defValue, af: AF.relu },
        { last: true, layer: LAYER.fully, param: SIV_fully.defValue, af: AF.relu },
        { last: true, layer: LAYER.fully, param: SIV_fully.defValue, af: AF.relu },
        { last: true, layer: LAYER.fully, param: SIV_fully.defValue, af: AF.relu },
    ],
    SetNnDetail: (value: NnDetail[]) => {},
    optimizer: OPTIMIZER.sgd,
    SetOptimizer: (value: OPTIMIZER) => {},
    nnHparam: { lr: SIV_lr.defValue, miniBatch: SIV_miniBatch.defValue, epoch: SIV_epoch.defValue },
    SetNnHparam: (value: NnHparam) => {},
    rfHparam: { nEstimators: SIV_nEstimators.defValue, maxFeatures: MAX_FEATURES.sqrt,
                maxDepth: SIV_maxDepth.defValue, minSamplesSplit: SIV_minSamplesSplit.defValue },
    SetRfHparam: (value: RfHparam) => {},
    svmHparam: { kernel: KERNEL.rbf, c: SIV_c.defValue, gamma: SIV_gamma.defValue },
    SetSvmHparam: (value: SvmHparam) => {},
    knnHparam: { nNeighbors: SIV_nNeighbors.defValue, weights: WEIGHTS.uniform, algorithm: ALGORITHM.auto, metric: METRIC.euclidean },
    SetKnnHparam: (value: KnnHparam) => {},
});

// インポートフェッチ 引数
export type FetchImportProps = {
    preSelectData: INPUT_DATA;
    SetInputDataVal: (value: (string | number)[][]) => void;
}
// 前処理フェッチ 引数
export type FetchPreprocProps = {
    preTarget: string;
    SetPreprocCols: (value: string[]) => void;
    SetPreprocData: (value: (string | number)[][]) => void;
    SetPreprocCont: (value: string[]) => void;
}
// ターゲット予測値／正解値
export type TargetValues = {
    yPred: number[];
    yTest: number[];
}
// 学習フェッチ 引数
export type FetchLearningProps = {
    SetTargetValues: (value: TargetValues) => void;
    SetValLosses: (value: number[]) => void;
    SetValMetrics: (value: number[]) => void;
    SetTestMetrics: (value: number[]) => void;
}

// ツールチップ説明文 共通
export const tooltipML = "プログラムがデータを分析し学習することで、データのパターンやルールを発見する技術のこと。学習成果に基づいて、データの予測や判断を行うことができる。";
export const tooltipReg = "入力データからターゲットの数値を予測すること。例えば、住宅の情報からその価格を予測したり、料理レシピから栄養価を予測したりすること。";
export const tooltipClass = "入力データからターゲットのカテゴリに分類すること。例えば、身長と体重の情報から男性・女性を分類したり、動物の情報が犬・猫・馬のいずれであるか分類したりすること。";
