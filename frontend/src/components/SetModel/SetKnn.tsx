/*****************************************************************************
 * 機能：k近傍法設定
 * 概要：k近傍法の各種設定を行う。
 *****************************************************************************/
import React from "react";
import "../../style.css";
import Tooltip from "@mui/material/Tooltip";
import { CommonSInput, CommonTButton, CONFIG_KEY } from "../index";

export default function SetKnn() {
  // ツールチップ説明文
  const tooltipNNeighbors = "分類や回帰を行う際に考慮する近傍点の数。小さいほど複雑なパターンを学習できるが、過学習のリスクも高まる。";
  const tooltipWeights = "近傍点の重み付け方法。";
  const tooltipAlgorithm = "入力データから最近傍点を見つけるために使用するアルゴリズム。";
  const tooltipMetric = "入力データ間の距離を測定する尺度。どのデータを最近傍点と見なすか決定する際に使用する。";

  return (
    <div className="grid-hParam">
      {/* 近傍数インプット */}
      <Tooltip title={tooltipNNeighbors} placement="bottom-start">
        <div className="text-hParam">近傍数<br />(n_neighbors)</div>
      </Tooltip>
      <CommonSInput configKey={CONFIG_KEY.nNeighbors} />

      {/* 重み選択 */}
      <Tooltip title={tooltipWeights} placement="bottom-start">
        <div className="text-hParam" style={{ marginLeft: 30 }}>重み<br />(weights)</div>
      </Tooltip>
      <CommonTButton configKey={CONFIG_KEY.weights} />

      {/* アルゴリズム選択 */}
      <Tooltip title={tooltipAlgorithm} placement="bottom-start">
        <div className="text-hParam">アルゴリズム<br />(algorithm)</div>
      </Tooltip>
      <CommonTButton configKey={CONFIG_KEY.algorithm} />

      {/* 距離尺度選択 */}
      <Tooltip title={tooltipMetric} placement="bottom-start">
        <div className="text-hParam" style={{ marginLeft: 30 }}>距離尺度<br />(metric)</div>
      </Tooltip>
      <CommonTButton configKey={CONFIG_KEY.metric} />
    </div>
  );
}
