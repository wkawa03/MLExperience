/*****************************************************************************
 * 機能：機械学習簡易体験システム メイン
 * 概要：データの前処理やモデルの設定を行い、簡易的に機械学習を行う。
 *****************************************************************************/
import React, { useState, useEffect, useMemo } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { SetInputData, SetModel, ExecLearning, NnDetail, NnHparam,
         RfHparam, SvmHparam, KnnHparam, CommonContext, ModelContext,
         INPUT_DATA, PROBLEM, MODEL, LAYER, AF, OPTIMIZER, MAX_FEATURES, KERNEL, WEIGHTS, ALGORITHM, METRIC,
         SIV_fully, SIV_lr, SIV_miniBatch, SIV_epoch, SIV_nEstimators, SIV_maxDepth, SIV_minSamplesSplit,
         SIV_c, SIV_gamma, SIV_nNeighbors } from "./components/index";

export default function App() {
  // 選択入力データ
  const [selectData, SetSelectData] = useState(INPUT_DATA.titanic);
  // 選択ターゲット
  const [target, SetTarget] = useState("");
  // 前処理データ
  const [preprocData, SetPreprocData] = useState<(string | number)[][]>([]);
  useEffect(() => {
    // 選択ターゲットが変化した場合、前処理データをクリア
    SetPreprocData([]);
  }, [target]);
  // 分析問題 (回帰／分類)
  const [problem, SetProblem] = useState<(PROBLEM | number)[]>([PROBLEM.regression, 1]);

  // モデル
  const [model, SetModelVal] = useState(MODEL.rf);
  // ニューラルネットワーク詳細設定
  const [nnDetails, SetNnDetail] = useState<NnDetail[]>([
    { last: false, layer: LAYER.batch, param: 0, af: AF.relu },
    { last: false, layer: LAYER.fully, param: SIV_fully.defValue, af: AF.relu },
    { last: true, layer: LAYER.fully, param: SIV_fully.defValue, af: AF.relu },
    { last: true, layer: LAYER.fully, param: SIV_fully.defValue, af: AF.relu },
    { last: true, layer: LAYER.fully, param: SIV_fully.defValue, af: AF.relu },
  ]);
  // 最適化アルゴリズム
  const [optimizer, SetOptimizer] = useState(OPTIMIZER.sgd);
  // ニューラルネットワーク ハイパーパラメータ
  const [nnHparam, SetNnHparam] = useState<NnHparam>(
    { lr: SIV_lr.defValue, miniBatch: SIV_miniBatch.defValue, epoch: SIV_epoch.defValue },
  );
  // ランダムフォレスト ハイパーパラメータ
  const [rfHparam, SetRfHparam] = useState<RfHparam>(
    { nEstimators: SIV_nEstimators.defValue, maxFeatures: MAX_FEATURES.sqrt,
      maxDepth: SIV_maxDepth.defValue, minSamplesSplit: SIV_minSamplesSplit.defValue },
  );
  // サポートベクターマシン ハイパーパラメータ
  const [svmHparam, SetSvmHparam] = useState<SvmHparam>(
    { kernel: KERNEL.rbf, c: SIV_c.defValue, gamma: SIV_gamma.defValue },
  );
  // k近傍法 ハイパーパラメータ
  const [knnHparam, SetKnnHparam] = useState<KnnHparam>(
    { nNeighbors: SIV_nNeighbors.defValue, weights: WEIGHTS.uniform, algorithm: ALGORITHM.auto, metric: METRIC.euclidean },
  );
  // フェッチ待ち状態
  const [waitFetch, SetWaitFetch] = useState("");
  // フェッチエラー
  const [fetchError, SetFetchError] = useState("");

  // 共通コンテキストの値設定
  const commonCtValue = useMemo(() => ({
    selectData, SetSelectData,
    target, SetTarget,
    problem, SetProblem,
    waitFetch, SetWaitFetch,
    fetchError, SetFetchError,
  }), [selectData, target, problem, waitFetch, fetchError]);

  // モデル設定コンテキストの値設定
  const modelCtValue = useMemo(() => ({
    model, SetModelVal,
    nnDetails, SetNnDetail,
    optimizer, SetOptimizer,
    nnHparam, SetNnHparam,
    rfHparam, SetRfHparam,
    svmHparam, SetSvmHparam,
    knnHparam, SetKnnHparam,
  }), [model, nnDetails, optimizer, nnHparam, rfHparam, svmHparam, knnHparam]);

  // MUIダークテーマ
  const darkTheme = createTheme({ palette: { mode: "dark" } });

  return (
    // MUIをダークテーマに設定
    <ThemeProvider theme={darkTheme}>
      {/* サイドメニュー */}
      <div className="sidebar">
        {/* クリックで該当ページにスクロール */}
        <div><a className="a-inherit" href="#SetInputData">１. 入力データ設定</a></div>
        <div className="margin-list">
          <a className="a-inherit" href="#SetInputData">－ データインポート</a>
        </div>
        <div className="margin-list">
          <a className="a-inherit" href="#Preproc">－ 前処理</a>
        </div>
        <div className="margin-cont">
          <a className="a-inherit" href="#SetModel">２. モデル設定</a>
        </div>
        {(process.env.NODE_ENV === "development") && (<>
          <div className="margin-list">
            <a className="a-inherit" href="#SetModel">－ モデル選択</a>
          </div>
          <div className="margin-list">
            <a className="a-inherit" href="#SetDetail">－ モデル詳細設定</a>
          </div>
        </>)}
        <div className="margin-cont">
          <a className="a-inherit" href="#ExecLearning">３. 学習実行</a>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="main-cont">
        <CommonContext.Provider value={commonCtValue}>
          {/* 入力データ設定 */}
          <section id="SetInputData">
            <SetInputData preprocData={preprocData} SetPreprocData={SetPreprocData} />
          </section>

          {/* 前処理データが設定されている場合に表示 */}
          {(preprocData.length > 0) && (
            <ModelContext.Provider value={modelCtValue}>
              {/* モデル設定 */}
              <section id="SetModel" className="margin-section">
                <SetModel />
              </section>

              {/* 学習実行 */}
              <section id="ExecLearning" className="margin-section">
                <ExecLearning />
              </section>
            </ModelContext.Provider>
          )}
        </CommonContext.Provider>
        <div style={{ height: 150 }} />
      </div>
    </ThemeProvider>
  );
}
