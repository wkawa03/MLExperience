/*****************************************************************************
 * 機能：トグルボタン 共通コンポーネント
 * 概要：共通のトグルボタンコンポーネント。
 *****************************************************************************/
import React, { useContext } from "react";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Tooltip from "@mui/material/Tooltip";
import { ModelContext, INPUT_DATA, MODEL, LAYER, AF, OPTIMIZER, MAX_FEATURES, KERNEL,
         WEIGHTS, ALGORITHM, METRIC, CONFIG_KEY, SIV_fully, SIV_dropout } from "../index";

export default function CommonTButton(props: {
  configKey: CONFIG_KEY;
  preSelectDataUS?: { preSelectData: string; SetPreSelectData: (value: INPUT_DATA) => void; };
  nnDetailIdx?: number;
}) {
  // オプショナル引数のデフォルト値を設定(未使用)
  const { nnDetailIdx = 0 } = props;

  // useStateを取得
  const { model, SetModelVal, nnDetails, SetNnDetail, optimizer, SetOptimizer,
          rfHparam, SetRfHparam, svmHparam, SetSvmHparam, knnHparam, SetKnnHparam } = useContext(ModelContext);

  type Config = {
    tButtonValues: { value: string; display: string; tooltipTitle?: string; }[]; // トグルボタン設定値
    selectValue: string | undefined; // 選択値
    UpdateFunc: (newValue: string) => void; // 更新関数
  }
  type ConfigMap = { [key: string]: Config; }

  const configMap: ConfigMap = {
    // 入力データ
    inputData: {
      tButtonValues: [
        { value: INPUT_DATA.titanic, display: "タイタニック号<br/>乗客リスト" },
        { value: INPUT_DATA.lego, display: "レゴブロック" },
        { value: INPUT_DATA.house, display: "住宅情報" },
      ],
      selectValue: props.preSelectDataUS?.preSelectData,
      UpdateFunc: (newValue) => props.preSelectDataUS && props.preSelectDataUS.SetPreSelectData(newValue as INPUT_DATA),
    },
    // モデル
    model: {
      tButtonValues: [
        { value: MODEL.nn, display: "ニューラルネットワーク<br/>(ディープラーニング)",
          tooltipTitle: "脳のニューロンを模したモデルで、設定によって回帰・分類の両問題に対応できる。主にレイヤーと活性化関数という処理が実行され、それらを何層か定義し順々に実行する。"
                        + "この層が複数存在する場合、一般的にディープラーニングと呼ばれる。当システムでは最大5層までとする。" },
        { value: MODEL.rf, display: "ランダムフォレスト",
          tooltipTitle: "決定木という、木構造で判定を繰返しデータを分類する手法を使用したモデル。回帰・分類の両問題に対応できる。ランダムフォレストでは、決定木を複数組合せることで予測の精度を高めている。" },
        { value: MODEL.svm, display: "サポートベクターマシン<br/>(SVM)",
          tooltipTitle: "サポートベクターという、データを適切に分類するための境界を見つける手法を使用したモデルで、分類問題を得意とする。外れ値(他に比べ極端に大きい／小さい値)やノイズを含むデータに比較的強い。" },
        { value: MODEL.knn, display: "k近傍法<br/>(k-NN)",
          tooltipTitle: "「似たものは近くに存在する」という考え方に基づいてデータを分類するモデルで、分類問題を得意とする。シンプルな問題や小規模なデータに対して効果的。" },
      ],
      selectValue: model,
      UpdateFunc: (newValue) => SetModelVal(newValue as MODEL),
    },
    // ニューラルネットワーク レイヤー
    layer: {
      tButtonValues: [
        { value: LAYER.fully, display: "全結合層",
          tooltipTitle: "最も基本的で広く使われるレイヤー。入力データもしくは前の層の出力に対して、各ノードが重みを掛け合わせバイアスを加える計算を行う。" },
        { value: LAYER.batch, display: "バッチ正規化層",
          tooltipTitle: "入力データもしくは前の層の出力に対して、平均と分散を計算し正規化することで、学習の安定性を向上させる。" },
        { value: LAYER.dropout, display: "ドロップアウト層",
          tooltipTitle: "ランダムにノードを無効化する。過学習を防ぐ目的で使用される。" },
      ],
      selectValue: nnDetails[nnDetailIdx].layer,
      UpdateFunc: (newValue) => UpdateNnDetail(newValue),
    },
    // ニューラルネットワーク 活性化関数
    af: {
      tButtonValues: [
        { value: AF.relu, display: "ReLU",
          tooltipTitle: "最も一般的に使われる活性化関数。レイヤーで算出した値が正数の場合はそのまま出力し、負数の場合は0を出力する。これにより出力が間引きされ学習が効率的になる。" },
        { value: AF.tanh, display: "tanh",
          tooltipTitle: "レイヤーで算出した値に対してS字型に-1～1の値を出力する。出力が中心化され学習が効率的になる。" },
        { value: AF.none, display: "なし",
          tooltipTitle: "レイヤーで算出した値をそのまま出力する。" },
      ],
      selectValue: nnDetails[nnDetailIdx].af,
      UpdateFunc: (newValue) => UpdateNnDetail(newValue),
    },
    // 最適化アルゴリズム
    optimizer: {
      tButtonValues: [
        { value: OPTIMIZER.sgd, display: "確率的勾配降下法<br/>(SGD)",
          tooltipTitle: "最も基本的な手法。ランダムに選ばれたデータを使用して勾配(パラメータを更新するべき方向)を計算し、パラメータを更新する。" },
        { value: OPTIMIZER.momentum, display: "モーメンタム",
          tooltipTitle: "確率的勾配降下法(SGD)に慣性を考慮する(勾配の大きさによりパラメータの更新量をより大きく／小さくする)ことで、より速い最適化を実現する手法。" },
        { value: OPTIMIZER.rmsprop, display: "RMSprop",
          tooltipTitle: "学習が進むにつれてパラメータの更新量を小さくしていき、最適解に到達し易くする手法。移動平均を使い更新量が単調減少するのを防ぐ。" },
        { value: OPTIMIZER.adam, display: "Adam",
          tooltipTitle: "モーメンタムとRMSpropのアイデアを組み合わせた手法。" },
      ],
      selectValue: optimizer,
      UpdateFunc: (newValue) => SetOptimizer(newValue as OPTIMIZER),
    },
    // ランダムフォレスト 特徴の最大数
    maxFeatures: {
      tButtonValues: [
        { value: MAX_FEATURES.sqrt, display: "総数の平方根" },
        { value: MAX_FEATURES.log2, display: "総数の対数" },
        { value: MAX_FEATURES.none, display: "総数" },
      ],
      selectValue: rfHparam.maxFeatures,
      UpdateFunc: (newValue) => SetRfHparam({ ...rfHparam, maxFeatures: newValue as MAX_FEATURES }),
    },
    // サポートベクターマシン カーネル選択
    kernel: {
      tButtonValues: [
        { value: KERNEL.rbf, display: "放射基底関数<br/>(RBF)" },
        { value: KERNEL.linear, display: "線形関数<br/>(Linear)" },
        { value: KERNEL.poly, display: "多項式関数<br/>(Polynomial)" },
        { value: KERNEL.sigmoid, display: "シグモイド関数<br/>(Sigmoid)" },
      ],
      selectValue: svmHparam.kernel,
      UpdateFunc: (newValue) => SetSvmHparam({ ...svmHparam, kernel: newValue as KERNEL }),
    },
    // k近傍法 重み
    weights: {
      tButtonValues: [
        { value: WEIGHTS.uniform, display: "均一<br/>(uniform)",
          tooltipTitle: "均一に重み付けする。" },
        { value: WEIGHTS.distance, display: "距離<br/>(distance)",
          tooltipTitle: "距離に反比例して重みを付け、近い点ほど影響を大きくする。" },
      ],
      selectValue: knnHparam.weights,
      UpdateFunc: (newValue) => SetKnnHparam({ ...knnHparam, weights: newValue as WEIGHTS }),
    },
    // k近傍法 アルゴリズム
    algorithm: {
      tButtonValues: [
        { value: ALGORITHM.auto, display: "自動設定<br/>(auto)",
          tooltipTitle: "最も適切なアルゴリズムを自動で設定。" },
        { value: ALGORITHM.ball_tree, display: "ボールツリー<br/>(ball_tree)",
          tooltipTitle: "データを多次元空間内の球状に分割し、近傍点を検索する。データの行数・列数が多い場合に効果的。" },
        { value: ALGORITHM.kd_tree, display: "k次元ツリー<br/>(kd_tree)",
          tooltipTitle: "データを各次元の軸に沿って分割し、生成される空間から近傍点を検索する。データの行数が多く、列数が少ない場合に効果的。" },
        { value: ALGORITHM.brute, display: "力任せ<br/>(brute)",
          tooltipTitle: "全てのデータ間の距離を総当たりで計算する。データの行数が少なく、列数が多い場合に効果的。" },
      ],
      selectValue: knnHparam.algorithm,
      UpdateFunc: (newValue) => SetKnnHparam({ ...knnHparam, algorithm: newValue as ALGORITHM }),
    },
    // k近傍法 距離尺度
    metric: {
      tButtonValues: [
        { value: METRIC.euclidean, display: "ユークリッド<br/>(euclidean)",
          tooltipTitle: "多次元空間における二点間の直線距離を測定する。" },
        { value: METRIC.manhattan, display: "マンハッタン<br/>(manhattan)",
          tooltipTitle: "各次元に沿った距離の総和を測定する。" },
        { value: METRIC.chebyshev, display: "チェビシェフ<br/>(chebyshev)",
          tooltipTitle: "各次元に沿った距離の最大差異を測定する。" },
      ],
      selectValue: knnHparam.metric,
      UpdateFunc: (newValue) => SetKnnHparam({ ...knnHparam, metric: newValue as METRIC }),
    },
  };
  // キーに対応するコンフィグを設定
  const { tButtonValues, selectValue = "", UpdateFunc } = configMap[props.configKey] || [];

  // 更新関数 － ニューラルネットワーク詳細設定
  const UpdateNnDetail = (newValue: string) => {
    const newNnDetail = [...nnDetails];

    // レイヤー
    if (props.configKey === CONFIG_KEY.layer) {
      // パラメータのデフォルト値設定
      let paramDef = 0;
      if (newValue === CONFIG_KEY.fully) {
        paramDef = SIV_fully.defValue;
      } else if (newValue === CONFIG_KEY.dropout) {
        paramDef = SIV_dropout.defValue;
      }

      newNnDetail[nnDetailIdx] = {
        ...newNnDetail[nnDetailIdx], layer: newValue as LAYER, param: paramDef,
      };
    // 活性化関数
    } else {
      newNnDetail[nnDetailIdx] = {
        ...newNnDetail[nnDetailIdx], af: newValue as AF,
      };
    }
    // 情報更新
    SetNnDetail(newNnDetail);
  };

  // 選択変更ハンドラ
  const HandleChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: string,
  ) => {
    // 選択されている場合に情報更新 (未選択状態なし)
    if (newValue !== null) {
      UpdateFunc(newValue);
    }
  };

  return (
    <ToggleButtonGroup
      color="primary"
      value={selectValue}
      exclusive
      onChange={HandleChange}
    >
      { tButtonValues.map((tButtonValue) => (
        <ToggleButton key={tButtonValue.value} value={tButtonValue.value}>
          {/* ツールチップが設定されている場合 */}
          {(tButtonValue.tooltipTitle) ? (
            <Tooltip title={tButtonValue.tooltipTitle} placement="bottom-start">
              <div className="text-UL" dangerouslySetInnerHTML={{ __html: tButtonValue.display }} style={{ textTransform: "none" }} />
            </Tooltip>
          )
          // ツールチップが設定されていない場合
          : (
            <div className="text-def" dangerouslySetInnerHTML={{ __html: tButtonValue.display }} style={{ textTransform: "none" }} />
          )}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
