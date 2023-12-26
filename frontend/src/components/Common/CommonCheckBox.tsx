/*****************************************************************************
 * 機能：チェックボックス 共通コンポーネント
 * 概要：共通のチェックボックスコンポーネント。
 *****************************************************************************/
import React, { useContext } from "react";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { ModelContext } from "../index";

export default function CommonCheckBox(props: {
  configKey: string;
  nnDetailIdx?: number;
}) {
  // オプショナル引数のデフォルト値を設定
  const { nnDetailIdx = 0 } = props;

  // useStateを取得
  const { nnDetails, SetNnDetail, rfHparam, SetRfHparam, svmHparam, SetSvmHparam } = useContext(ModelContext);

  type Config = {
    checkedCnd: boolean; // チェック条件
    UpdateFunc: (event: React.ChangeEvent<HTMLInputElement>) => void; // 更新関数
    label?: string; // ラベル
    disabledCnd?: boolean; // 無効条件
  }
  type ConfigMap = { [key: string]: Config; }

  const configMap: ConfigMap = {
    // ニューラルネットワーク 終了層
    lastLayer: {
      checkedCnd: nnDetails[nnDetailIdx].last,
      UpdateFunc: (newValue) => UpdateLastLayer(newValue),
      disabledCnd: nnDetailIdx === 4,
    },
    // ランダムフォレスト 決定木の最大深度
    maxDepth: {
      checkedCnd: rfHparam.maxDepth === 0,
      UpdateFunc: (newValue) => UpdateMaxDepth(newValue),
      label: "制限なし",
    },
    // サポートベクターマシン gamma
    gamma: {
      checkedCnd: svmHparam.gamma === 0,
      UpdateFunc: (newValue) => UpdateGamma(newValue),
      label: "自動設定",
    },
  };
  // キーに対応するコンフィグを設定
  const { checkedCnd, UpdateFunc, disabledCnd, label } = configMap[props.configKey] || [];

  // 更新関数 － ニューラルネットワーク 終了層
  const UpdateLastLayer = (event: React.ChangeEvent<HTMLInputElement>) => {
    // チェック状態を該当の層に反映
    const newChecked = event.target.checked;
    const newNnDetails = [...nnDetails];
    newNnDetails[nnDetailIdx].last = newChecked;

    // チェックONになった場合、以降の層のチェックもON
    if (newChecked) {
      for (let index = nnDetailIdx + 1; index < newNnDetails.length; index += 1) {
        newNnDetails[index].last = true;
      }
    }
    // 情報更新
    SetNnDetail(newNnDetails);
  };

  // 更新関数 － ランダムフォレスト 決定木の最大深度
  const UpdateMaxDepth = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = event.target.checked;
    // チェックONになった場合「0」を設定
    if (newChecked) {
      SetRfHparam({ ...rfHparam, maxDepth: 0 });
    // チェックOFFになった場合、初期値を設定
    } else {
      SetRfHparam({ ...rfHparam, maxDepth: 10 });
    }
  };

  // 更新関数 － サポートベクターマシン gamma
  const UpdateGamma = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = event.target.checked;
    // チェックONになった場合「0」を設定
    if (newChecked) {
      SetSvmHparam({ ...svmHparam, gamma: 0 });
    // チェックOFFになった場合、初期値を設定
    } else {
      SetSvmHparam({ ...svmHparam, gamma: 0.1 });
    }
  };

  return (
    (label !== undefined) ? (
      // ラベルが設定されている場合
      <FormControlLabel
        control={
          <Checkbox checked={checkedCnd} onChange={UpdateFunc} disabled={disabledCnd} />
        }
        label={label}
      />
    ) : (
      // ラベルが設定されていない場合
      <Checkbox checked={checkedCnd} onChange={UpdateFunc} disabled={disabledCnd} />
    )
  );
}
