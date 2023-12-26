/*****************************************************************************
 * 機能：スライダーインプット 共通コンポーネント
 * 概要：共通のスライダーインプットコンポーネント。
 *****************************************************************************/
import React, { useContext } from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Slider from "@mui/material/Slider";
import MuiInput from "@mui/material/Input";
import { ModelContext, SInputValue, SIV_fully, SIV_dropout, SIV_lr, SIV_miniBatch, SIV_epoch, SIV_nEstimators,
         SIV_maxDepth, SIV_minSamplesSplit, SIV_c, SIV_gamma, SIV_nNeighbors, CONFIG_KEY } from "../index";

const Input = styled(MuiInput)`
  width: 42px;
`;

export default function CommonSInput(props: {
  configKey: string;
  nnDetailIdx?: number;
}) {
  // オプショナル引数のデフォルト値を設定
  const { nnDetailIdx = 0 } = props;

  // useStateを取得
  const { nnDetails, SetNnDetail, nnHparam, SetNnHparam,
          rfHparam, SetRfHparam, svmHparam, SetSvmHparam, knnHparam, SetKnnHparam } = useContext(ModelContext);

  type Config = {
    sInputValue: SInputValue; // 最小・最大・デフォルト値
    value: number; // 設定値
    UpdateFunc: (newValue: number) => void; // 更新関数
    sxWidth?: number; // テキストサイズ幅
  }
  type ConfigMap = { [key: string]: Config; }

  const config: ConfigMap = {
    // ニューラルネットワーク レイヤー
    fully: {
      sInputValue: SIV_fully, value: nnDetails[nnDetailIdx].param,
      UpdateFunc: (newValue) => UpdateNnDetail(newValue),
    },
    dropout: {
      sInputValue: SIV_dropout, value: nnDetails[nnDetailIdx].param,
      UpdateFunc: (newValue) => UpdateNnDetail(newValue),
    },
    // ニューラルネットワーク ハイパーパラメータ
    lr: {
      sInputValue: SIV_lr, value: nnHparam.lr,
      UpdateFunc: (newValue) => SetNnHparam({ ...nnHparam, lr: newValue }),
      sxWidth: 60,
    },
    miniBatch: {
      sInputValue: SIV_miniBatch, value: nnHparam.miniBatch,
      UpdateFunc: (newValue) => SetNnHparam({ ...nnHparam, miniBatch: newValue }),
    },
    epoch: {
      sInputValue: SIV_epoch, value: nnHparam.epoch,
      UpdateFunc: (newValue) => SetNnHparam({ ...nnHparam, epoch: newValue }),
    },
    // ランダムフォレスト ハイパーパラメータ
    nEstimators: {
      sInputValue: SIV_nEstimators, value: rfHparam.nEstimators,
      UpdateFunc: (newValue) => SetRfHparam({ ...rfHparam, nEstimators: newValue }),
      sxWidth: 60,
    },
    maxDepth: {
      sInputValue: SIV_maxDepth, value: rfHparam.maxDepth,
      UpdateFunc: (newValue) => SetRfHparam({ ...rfHparam, maxDepth: newValue }),
    },
    minSamplesSplit: {
      sInputValue: SIV_minSamplesSplit, value: rfHparam.minSamplesSplit,
      UpdateFunc: (newValue) => SetRfHparam({ ...rfHparam, minSamplesSplit: newValue }),
    },
    // サポートベクターマシン ハイパーパラメータ
    c: {
      sInputValue: SIV_c, value: svmHparam.c,
      UpdateFunc: (newValue) => SetSvmHparam({ ...svmHparam, c: newValue }),
    },
    gamma: {
      sInputValue: SIV_gamma, value: svmHparam.gamma,
      UpdateFunc: (newValue) => SetSvmHparam({ ...svmHparam, gamma: newValue }),
      sxWidth: 60,
    },
    // k近傍法 ハイパーパラメータ
    nNeighbors: {
      sInputValue: SIV_nNeighbors, value: knnHparam.nNeighbors,
      UpdateFunc: (newValue) => SetKnnHparam({ ...knnHparam, nNeighbors: newValue }),
    },
  };
  // キーに対応するコンフィグを設定
  const { sInputValue, value, UpdateFunc, sxWidth = 50 } = config[props.configKey] || [];

  // 更新関数 － ニューラルネットワーク レイヤー
  const UpdateNnDetail = (newValue: number) => {
    // 入力値を該当の層に反映
    const newNnDetail = [...nnDetails];
    newNnDetail[nnDetailIdx].param = newValue;
    SetNnDetail(newNnDetail);
  };

  // スライダー変更ハンドラ (200ms毎に更新)
  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    // 更新関数実施
    UpdateFunc(newValue as number);
  };

  // テキスト変更ハンドラ
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue;
    // 入力が削除された場合、デフォルト値を設定
    if (event.target.value === "") {
      newValue = sInputValue.defValue;
    } else {
      newValue = Number(event.target.value);
    }

    // 最小値が1以上の場合(小数点以下を含まない場合)、小数点以下を四捨五入
    if (sInputValue.minValue >= 1) {
      newValue = Math.round(newValue);
    }
    // 更新関数実施
    UpdateFunc(newValue);
  };

  // ブラーハンドラ
  const handleBlur = () => {
    // 最小／最大値の超過チェック
    if (value < sInputValue.minValue) {
      UpdateFunc(sInputValue.minValue);
    } else if (value > sInputValue.maxValue) {
      UpdateFunc(sInputValue.maxValue);
    }
  };

  // 無効化条件
  const disabled = ((props.configKey === CONFIG_KEY.maxDepth) && (rfHparam.maxDepth === 0))
                   || ((props.configKey === CONFIG_KEY.gamma) && (svmHparam.gamma === 0));

  return (
    <Box sx={{ width: 200 + sxWidth }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs>
          {/* スライダー */}
          <Slider
            value={typeof value === "number" ? value : sInputValue.defValue}
            onChange={handleSliderChange}
            min={sInputValue.minValue}
            max={sInputValue.maxValue}
            step={sInputValue.minValue}
            aria-labelledby="input-slider"
            disabled={disabled}
          />
        </Grid>
        <Grid item>
          {/* テキスト */}
          <Input
            value={value}
            size="small"
            sx={{ width: sxWidth }}
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputProps={{
              min: sInputValue.minValue, max: sInputValue.maxValue, step: (sInputValue.maxValue / 10),
              type: "number", "aria-labelledby": "input-slider",
            }}
            disabled={disabled}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
