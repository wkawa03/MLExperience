/*****************************************************************************
 * 機能：ニューラルネットワーク設定
 * 概要：ニューラルネットワークの各種設定を行う。
 *****************************************************************************/
import React, { useContext } from "react";
import "../../style.css";
import Tooltip from "@mui/material/Tooltip";
import { CommonContext, ModelContext, CommonCheckBox, CommonTButton, CommonSInput,
         CONFIG_KEY, LAYER, PROBLEM } from "../index";

export default function SetNn() {
  // useStateを取得
  const { problem } = useContext(CommonContext);
  const { nnDetails } = useContext(ModelContext);

  // ツールチップ説明文
  const tooltipLayer = "入力データもしくは、前の層で出力した値に対して行う処理。";
  const tooltipAF = "レイヤーで算出した値から、次の層への出力を決定するための処理。";
  const tooltipOpt = "全結合層における「重み」や「バイアス」等をパラメータと呼び、それらを学習の過程で最適化して予測の性能を高めるアルゴリズム。";
  const tooltipLR = "計算されたパラメータの更新量に学習率を掛けた値で各パラメータを更新する。学習率が適切であると最適解に到達し易くなる。";
  const tooltipBatch = "入力データを「ミニバッチ」という小さなグループに分割し、各ミニバッチ毎に学習を進める。ミニバッチ数は1グループあたりのデータ数のこと。"
                       + "ミニバッチ数が適切であると、学習の効率やモデルの性能が向上する。";
  const tooltipEpoch = "「エポック」は入力データ全体をモデルによって1度学習させることを表す単位。"
                       + "最大エポック数は入力データ全体を最大で何度学習させるか示す値のこと。学習を進める中で以降のモデルの性能向上が見込まれない場合、最大エポック数未満で学習を終了する場合がある。";
  // 中間層の数
  const layers = ["１", "２", "３", "４", "５"];

  return (<>
    {(process.env.NODE_ENV === "production") && (<>
      <div style={{ color: "red" }}>サーバの都合で学習の実行はできません。</div>
    </>)}

    <div className="grid-setNn margin-cont">
      {/* ヘッダ */}
      <div className="info" />
      <div className="info text-def" style={{ justifyContent: "center" }}>終了</div>
      <div className="info">
        <Tooltip title={tooltipLayer} placement="bottom-start">
          <div className="text-UL">レイヤー</div>
        </Tooltip>
      </div>
      <div className="info">
        <Tooltip title={tooltipAF} placement="bottom-start">
          <div className="text-UL">活性化関数</div>
        </Tooltip>
      </div>

      {/* 中間層設定 */}
      { layers.map((layer, index) => (
        // 第1層もしくは、前の層が終了指定されていない場合に表示
        ((index === 0) || !(nnDetails[index - 1].last)) && (
          <React.Fragment key={index}>
            <div className="item text-def" style={{ width: 50 }}>
              第{layer}層
            </div>
            {/* 終了チェックボックス */}
            <div className="item" style={{ width: 50 }}>
              <CommonCheckBox configKey={CONFIG_KEY.lastLayer} nnDetailIdx={index} />
            </div>
            <div className="item" style={{ width: 400 }}>
              {/* レイヤー選択 */}
              <CommonTButton configKey={CONFIG_KEY.layer} nnDetailIdx={index} />
              {/* パラメータインプット (バッチ正規化層以外の場合に表示) */}
              {(nnDetails[index].layer !== LAYER.batch) && (
                <div className="grid-def" style={{ columnGap: 20, marginTop: 20 }}>
                  {/* 全結合層の場合「ノード数」、ドロップアウト層の場合「ドロップアウト率」を表示 */}
                  {(nnDetails[index].layer === LAYER.fully) ? (<>ノード数</>) : (<>ドロップアウト率</>)}
                  <CommonSInput configKey={nnDetails[index].layer} nnDetailIdx={index} />
                </div>
              )}
            </div>
            {/* 活性化関数選択 */}
            <div className="item" style={{ width: 200 }}>
              <CommonTButton configKey={CONFIG_KEY.af} nnDetailIdx={index} />
            </div>
          </React.Fragment>
        )
      ))}

      {/* 最終層表示 */}
      <div className="info text-def">最終層</div>
      <div className="info" />
      <div className="info text-def">{problem[0] === PROBLEM.regression ? "回帰" : "分類"}　　ノード数：{problem[1]}</div>
      <div className="info" />
    </div>

    <div className="separator-line" />

    <Tooltip title={tooltipOpt} placement="bottom-start">
      <div className="text-UL">最適化アルゴリズム</div>
    </Tooltip>
    {/* 最適化アルゴリズム選択 */}
    <div className="margin-sentence">
      <CommonTButton configKey={CONFIG_KEY.optimizer} />
    </div>

    <div className="grid-hParam margin-cont">
      {/* 学習率インプット */}
      <Tooltip title={tooltipLR} placement="bottom-start">
        <div className="text-hParam">学習率</div>
      </Tooltip>
      <CommonSInput configKey={CONFIG_KEY.lr} />

      {/* 空白セル */}
      <div /><div />

      {/* ミニバッチ数インプット */}
      <Tooltip title={tooltipBatch} placement="bottom-start">
        <div className="text-hParam">ミニバッチ数</div>
      </Tooltip>
      <CommonSInput configKey={CONFIG_KEY.miniBatch} />

      {/* 最大エポック数インプット */}
      <Tooltip title={tooltipEpoch} placement="bottom-start">
        <div className="text-hParam" style={{ marginLeft: 30 }}>最大エポック数</div>
      </Tooltip>
      <CommonSInput configKey={CONFIG_KEY.epoch} />
    </div>
  </>);
}
