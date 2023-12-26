/*****************************************************************************
 * 機能：サポートベクターマシン設定
 * 概要：サポートベクターマシンの各種設定を行う。
 *****************************************************************************/
import React, { useContext } from "react";
import "../../style.css";
import Tooltip from "@mui/material/Tooltip";
import { ModelContext, CommonTButton, CommonSInput, CommonCheckBox, CONFIG_KEY, KERNEL } from "../index";

export default function SetSvm() {
  // useStateを取得
  const { svmHparam } = useContext(ModelContext);

  // ツールチップ説明文
  const tooltipKernel = "データをより効果的に分類するために使用する関数。";
  const tooltipC = "誤分類を許容しない指標。大きいほど完全な分類を試みるが、過学習のリスクも高まる。";
  const tooltipGamma = "分類の複雑度。大きいほど完全な分類を試みるが、過学習のリスクも高まる。";

  return (
    <div className="grid-hParam">
      {/* カーネル選択 */}
      <Tooltip title={tooltipKernel} placement="bottom-start">
        <div className="text-hParam">カーネル</div>
      </Tooltip>
      <CommonTButton configKey={CONFIG_KEY.kernel} />

      {/* Cインプット */}
      <Tooltip title={tooltipC} placement="bottom-start">
        <div className="text-hParam" style={{ marginLeft: 30 }}>C</div>
      </Tooltip>
      <CommonSInput configKey={CONFIG_KEY.c} />

      {/* gammaインプット (カーネルに線形関数以外が選択されている場合に表示) */}
      {(svmHparam.kernel !== KERNEL.linear) && (<>
        <Tooltip title={tooltipGamma} placement="bottom-start">
          <div className="text-hParam">gamma</div>
        </Tooltip>
        <div>
          <CommonCheckBox configKey={CONFIG_KEY.gamma} />
          <CommonSInput configKey={CONFIG_KEY.gamma} />
        </div>
      </>)}
    </div>
  );
}
