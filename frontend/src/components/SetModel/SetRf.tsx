/*****************************************************************************
 * 機能：ランダムフォレスト設定
 * 概要：ランダムフォレストの各種設定を行う。
 *****************************************************************************/
import React from "react";
import "../../style.css";
import Tooltip from "@mui/material/Tooltip";
import { CommonSInput, CommonTButton, CommonCheckBox, CONFIG_KEY } from "../index";

export default function SetRf() {
  // ツールチップ説明
  const tooltipNEstimators = "決定木の数。大きいほど予測精度が向上するが、計算時間とメモリ使用量が増加する。";
  const tooltipMaxFeatures = "決定木に使用する特徴(入力データの種類)の最大数。大きいほど複雑なパターンを学習できるが、過学習のリスクも高まる。";
  const tooltipMaxDepth = "決定木の最大の深さ。大きいほど複雑なパターンを学習できるが、過学習のリスクも高まる。";
  const tooltipMinSamples = "ノード分割に必要な最小サンプル数。データのサンプル数がこの値以上の場合に、データの判定(ノード分割)を追加する。"
                            + "小さいほど複雑なパターンを学習できるが、過学習のリスクも高まる。";

  return (
    <div className="grid-hParam">
      {/* 決定木の数インプット */}
      <Tooltip title={tooltipNEstimators} placement="bottom-start">
        <div className="text-hParam">決定木の数<br />(n_estimators)</div>
      </Tooltip>
      <CommonSInput configKey={CONFIG_KEY.nEstimators} />

      {/* 特徴の最大数インプット */}
      <Tooltip title={tooltipMaxFeatures} placement="bottom-start">
        <div className="text-hParam" style={{ marginLeft: 30 }}>特徴の最大数<br />(max_features)</div>
      </Tooltip>
      <CommonTButton configKey={CONFIG_KEY.maxFeatures} />

      {/* 決定木の最大深度インプット */}
      <Tooltip title={tooltipMaxDepth} placement="bottom-start">
        <div className="text-hParam">決定木の最大深度<br />(max_depth)</div>
      </Tooltip>
      <div>
        <CommonCheckBox configKey={CONFIG_KEY.maxDepth} />
        <CommonSInput configKey={CONFIG_KEY.maxDepth} />
      </div>

      {/* ノード分割の最小サンプル数インプット */}
      <Tooltip title={tooltipMinSamples} placement="bottom-start">
        <div className="text-hParam" style={{ marginLeft: 30 }}>ノード分割の最小サンプル数<br />(min_samples_split)</div>
      </Tooltip>
      <CommonSInput configKey={CONFIG_KEY.minSamplesSplit} />
    </div>
  );
}
