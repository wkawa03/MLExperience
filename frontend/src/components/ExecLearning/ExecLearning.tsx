/*****************************************************************************
 * 機能：学習実行 メイン
 * 概要：機械学習の実行および、結果の表示を行う。
 *****************************************************************************/
import React, { useState, useEffect, useContext } from "react";
import "../../style.css";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import { CommonContext, TargetValues, FetchButton, LostLineChart, FETCH_REQ, PROBLEM, tooltipReg, tooltipClass } from "../index";

export default function ExecLearning() {
  // useStateを取得
  const { waitFetch, fetchError, problem } = useContext(CommonContext);

  // ターゲット予測値／正解値
  const [targetValues, SetTargetValues] = useState<TargetValues>({ yPred: [], yTest: [] });
  // 検証データ損失値
  const [valLosses, SetValLosses] = useState<number[]>([]);
  // 検証データ指標
  const [valMetrics, SetValMetrics] = useState<number[]>([]);
  // テストデータ指標
  const [testMetrics, SetTestMetrics] = useState<number[]>([]);
  useEffect(() => {
    // 学習待ち状態になった場合、各学習結果をクリア
    if (waitFetch === FETCH_REQ.Learning) {
      SetTargetValues({ yPred: [], yTest: [] });
      SetValLosses([]);
      SetValMetrics([]);
      SetTestMetrics([]);
    }
  }, [waitFetch]);

  // ツールチップ説明文
  const tooltipTrain = "内容は入力データと同様。入力データを学習を行う訓練データと、学習成果を確認する検証データに分けて学習を進める。";
  const tooltipTest = "学習したモデルを使用して実際に予測を行う入力データのこと。入力データのうち、学習に使用したデータとは異なるデータを使用する。";
  const tooltipLost = "モデルの予測がどの程度実際のデータから離れているかを表す数値。小さいほど予測が正しく、大きいほど予測が誤っていることを表す。"
                      + "当システムでは回帰問題はRMSE(二乗平均平方根誤差)、分類問題は交差エントロピーで求める。RMSEはターゲットの値の大きさに比例して大きくなる傾向がある。";
  const tooltipAccuracy = "全データのうち正しく分類された割合。正解数 ÷ 全データ数。";
  const tooltipPrecision = "Aと予測した中で実際にAであった数の割合。例えば男女の予測において、男性と予測した中で実際に男性であった数の割合。";
  const tooltipRecall = "Aであるデータのうち、Aと予測されたものの割合。例えば男女の予測において、男性の全データのうち男性と予測された数の割合。";
  const tooltipF1 = "精度と再現率の調和平均。";

  return (<>
    <h1>学習実行</h1>

    <div className="frame">
      <div className="grid-def" style={{ columnGap: 30 }}>
        {/* 学習実行ボタン */}
        <FetchButton req={FETCH_REQ.Learning} fetchLearning={{ SetTargetValues, SetValLosses, SetValMetrics, SetTestMetrics }} />
        <div className="grid-def">
          <div className="text-def">分析問題：</div>
          {(problem[0] === PROBLEM.regression) && (            
            <Tooltip title={tooltipReg} placement="bottom-start">
              <div className="text-UL">回帰</div>
            </Tooltip>
          )}
          {(problem[0] === PROBLEM.classification) && (   
            <Tooltip title={tooltipClass} placement="bottom-start">
              <div className="text-UL">分類</div>
            </Tooltip>
          )}
        </div>

        {/* 学習エラーメッセージ */}
        {(fetchError === FETCH_REQ.Learning) && (
          <div className="text-def" style={{ color: "red" }}>
            サーバとの通信エラーが発生しました。しばらく待って再度実行してください。<br />
            何度も発生する場合、サーバの処理限界を超過している可能性がありますので、モデルの設定を見直してください。
          </div>
        )}
        {(fetchError === `${FETCH_REQ.Learning} ValueError`) && (
          <div className="text-def" style={{ color: "red" }}>学習が正しく行われませんでした。モデルの設定を見直してください。</div>
        )}
      </div>

      {/* テストデータ指標が設定されていない場合に表示 */}
      {(testMetrics.length <= 0) && (
        <div style={{ width: 1000, height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* 学習中プログレス */}
          {(waitFetch === FETCH_REQ.Learning) && (<CircularProgress />)}
        </div>
      )}

      <div className="grid-def margin-cont">
        {/* 検証データ 損失値グラフ (検証データ損失値が設定されている場合に表示) */}
        <div>{(valLosses.length > 0) && (<LostLineChart valLosses={valLosses} />)}</div>
        <div>
          {/* 検証データ損失値が設定されている場合に表示 */}
          {(valLosses.length > 0) && (<>
            <div className="grid-def">
              <Tooltip title={tooltipTrain} placement="bottom-start">
                <div className="text-UL">検証データ</div>
              </Tooltip>
              <div className="text-def" style={{ marginLeft: 15 }}>ベストスコア</div>
            </div>
            {/* 検証データ 最小損失値 */}
            <div className="grid-def margin-sentence">
              <Tooltip title={tooltipLost} placement="bottom-start">
                <div className="text-UL">損失</div>
              </Tooltip>
              <div className="text-def">：{Math.min(...valLosses)}</div>
            </div>
          </>)}

          {/* 検証データ指標が設定されている場合に表示 */}
          {(valMetrics.length > 0) && (
            <div className="grid-metrics margin-sentence">
              {/* 検証データ 最大正解率 */}
              <Tooltip title={tooltipAccuracy} placement="bottom-start">
                <div className="text-UL">正解率(Accuracy)</div>
              </Tooltip>
              <div className="text-def">：{valMetrics[0]}%</div>
              {/* 検証データ 最大精度 */}
              <Tooltip title={tooltipPrecision} placement="bottom-start" style={{ marginLeft: 30 }}>
                <div className="text-UL">精度(Precision)</div>
              </Tooltip>
              <div className="text-def">：{valMetrics[1]}%</div>
              {/* 検証データ 最大再現率 */}
              <Tooltip title={tooltipRecall} placement="bottom-start">
                <div className="text-UL">再現率(Recall)</div>
              </Tooltip>
              <div className="text-def">：{valMetrics[2]}%</div>
              {/* 検証データ 最大F1スコア */}
              <Tooltip title={tooltipF1} placement="bottom-start" style={{ marginLeft: 30 }}>
                <div className="text-UL">F1スコア</div>
              </Tooltip>
              <div className="text-def">：{valMetrics[3]}%</div>
            </div>
          )}

          {/* 検証データが設定されている場合にマージン表示 */}
          {(valLosses.length > 0) && (<div className="margin-section" />)}

          {/* テストデータ指標が設定されている場合に表示 */}
          {(testMetrics.length > 0) && (<>
            <div className="grid-def">
              <Tooltip title={tooltipTest} placement="bottom-start">
                <div className="text-UL">テストデータ</div>
              </Tooltip>
              <div className="text-def" style={{ marginLeft: 15 }}>スコア</div>
            </div>
            {/* テストデータ 損失値 */}
            <div className="grid-def margin-sentence">
              <Tooltip title={tooltipLost} placement="bottom-start">
                <div className="text-UL">損失</div>
              </Tooltip>
              <div className="text-def"></div>：{testMetrics[0]}
            </div>
          </>)}

          {/* テストデータ指標の正解率以降が設定されている場合に表示 */}
          {(testMetrics.length > 1) && (
            <div className="grid-metrics margin-sentence">
              {/* テストデータ 正解率 */}
              <Tooltip title={tooltipAccuracy} placement="bottom-start">
                <div className="text-UL">正解率(Accuracy)</div>
              </Tooltip>
              <div className="text-def">：{testMetrics[1]}%</div>
              {/* テストデータ 精度 */}
              <Tooltip title={tooltipPrecision} placement="bottom-start" style={{ marginLeft: 30 }}>
                <div className="text-UL">精度(Precision)</div>
              </Tooltip>
              <div className="text-def">：{testMetrics[2]}%</div>
              {/* テストデータ 再現率 */}
              <Tooltip title={tooltipRecall} placement="bottom-start">
                <div className="text-UL">再現率(Recall)</div>
              </Tooltip>
              <div className="text-def">：{testMetrics[3]}%</div>
              {/* テストデータ F1スコア */}
              <Tooltip title={tooltipF1} placement="bottom-start" style={{ marginLeft: 30 }}>
                <div className="text-UL">F1スコア</div>
              </Tooltip>
              <div className="text-def">：{testMetrics[4]}%</div>
            </div>
          )}

        </div>
      </div>

      {/* テストデータ指標が設定されている場合に表示 */}
      {(testMetrics.length > 0) && (<>
        <div className="grid-def margin-section">
          <Tooltip title={tooltipTest} placement="bottom-start">
            <div className="text-UL">テストデータ</div>
          </Tooltip>
          <div className="text-def" style={{ marginLeft: 15 }}>詳細</div>
        </div>
        {/* ターゲット予測値／正解値 */}
        <div className="grid-tValues margin-sentence">
          <div className="text-def" style={{ width: 70 }}>予測値：</div>
          <div className="text-def">正解値：</div>
          {targetValues.yPred.map((yPred, index) => (
            <React.Fragment key={index}>
              <div className="text-def">{yPred}</div>
              <div className="text-def">{targetValues.yTest[index]}</div>
            </React.Fragment>
          ))}
        </div>
      </>)}

    </div>
  </>);
}
