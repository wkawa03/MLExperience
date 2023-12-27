/*****************************************************************************
 * 機能：モデル設定 メイン
 * 概要：機械学習のモデル選択および、各種設定を行う。
 *****************************************************************************/
import React, { useContext } from "react";
import "../../style.css";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import { CommonContext, ModelContext, CommonTButton, FetchButton, SetNn, SetRf, SetSvm, SetKnn,
         CONFIG_KEY, FETCH_REQ, MODEL, tooltipML, tooltipReg, tooltipClass } from "../index";

export default function SetModel() {
  // useStateを取得
  const { waitFetch, fetchError } = useContext(CommonContext);
  const { model } = useContext(ModelContext);

  // ツールチップ説明文
  const tooltipModel = "入力データを分析し、その結果を出力する仕組みのこと。様々な手法とパラメータが存在し、それらを適切に設定するとデータの予測性能が向上する。";
  const tooltipNode = "機械学習における基本的な処理単位のこと。ノード毎にデータの分析処理が行われる。1つのレイヤーの中に複数のノードが存在することが一般的である。";
  const tooltipOF = "機械学習が過度に最適化され、新しい未知のデータに対する予測性能が低下すること。";

  return (<>
    <h1>モデル設定</h1>

    <div className="frame">
      <div className="grid-def">
        <Tooltip title={tooltipML} placement="bottom-start">
          <div className="text-UL">機械学習</div>
        </Tooltip>
        の
        <Tooltip title={tooltipModel} placement="bottom-start">
          <div className="text-UL">モデル</div>
        </Tooltip>
        を設定してください。
      </div>

      <div className="text-def margin-sentence">
        ※各用語の説明は以下を参照してください。
      </div>
      <div className="grid-def" style={{ columnGap: 20 }}>
        <Tooltip title={tooltipReg} placement="bottom-start">
          <div className="text-UL">回帰問題</div>
        </Tooltip>
        <Tooltip title={tooltipClass} placement="bottom-start">
          <div className="text-UL">分類問題</div>
        </Tooltip>
        <Tooltip title={tooltipNode} placement="bottom-start">
          <div className="text-UL">ノード</div>
        </Tooltip>
        <Tooltip title={tooltipOF} placement="bottom-start">
          <div className="text-UL">過学習</div>
        </Tooltip>
      </div>

      {/* モデル選択 */}
      <div className="margin-cont">
        <CommonTButton configKey={CONFIG_KEY.model} />
      </div>

      {/* スペックの都合で自動設定(最適化)は開発環境のみ有効 */}
      {(process.env.NODE_ENV === "development") && (<>
        <div id="SetDetail" className="separator-line" />

        <div style={{ height: 50, display: "flex", alignItems: "center", columnGap: 30 }}>
          {/* 自動設定(最適化)ボタン */}
          <FetchButton req={FETCH_REQ.Optimize} />
          {/* 自動設定(最適化)中プログレス */}
          {(waitFetch === FETCH_REQ.Optimize) && (<CircularProgress style={{ marginLeft: 20 }} />)}
          {/* 自動設定(最適化)エラーメッセージ */}
          {(fetchError === FETCH_REQ.Optimize) && (
            <div style={{ color: "red" }}>サーバとの通信エラーが発生しました。しばらく待って再度実行してください。</div>
          )}
        </div>
      </>)}

      {/* ニューラルネットワーク設定 */}
      {(model === MODEL.nn) && (<div className="margin-cont"><SetNn /></div>)}
      {/* ランダムフォレスト設定 */}
      {(model === MODEL.rf) && (<div className="margin-cont"><SetRf /></div>)}
      {/* サポートベクターマシン設定 */}
      {(model === MODEL.svm) && (<div className="margin-cont"><SetSvm /></div>)}
      {/* k近傍法設定 */}
      {(model === MODEL.knn) && (<div className="margin-cont"><SetKnn /></div>)}
    </div>
  </>);
}
