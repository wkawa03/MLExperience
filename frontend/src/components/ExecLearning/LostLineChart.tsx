/*****************************************************************************
 * 機能：検証データ 損失値グラフ
 * 概要：検証データの損失値をグラフ表示する。
 *****************************************************************************/
import React from "react";
import { LineChart } from "@mui/x-charts/LineChart";

export default function LostLineChart(props: { valLosses: number[]; }) {
  // 損失値のデータサイズによって表示間隔を調整
  let step = 5;
  if (props.valLosses.length > 100) {
    step = 20;
  } else if (props.valLosses.length > 50) {
    step = 10;
  }

  // X軸データを表示間隔毎に設定
  const xAxisData: (number | string)[] = [];
  const selectValLosses: number[] = [];
  for (let xAxis = 0; xAxis <= props.valLosses.length; xAxis += step) {
    // 先頭のデータを設定
    if (xAxis === 0) {
      xAxisData.push(1);
      selectValLosses.push(props.valLosses[0]);

    // 表示間隔毎のデータを設定
    } else {
      xAxisData.push(xAxis);
      selectValLosses.push(props.valLosses[xAxis - 1]);
    }
  }
  // データサイズが表示間隔で端数が発生する場合、末尾のデータを設定
  if (props.valLosses.length % step !== 0) {
    xAxisData.push(props.valLosses.length);
    selectValLosses.push(props.valLosses[props.valLosses.length - 1]);
  }

  // X軸末尾に凡例を設定
  xAxisData[xAxisData.length - 1] = `${xAxisData[xAxisData.length - 1]}\n(エポック)`;

  return (<>
    {/* Y軸凡例 */}
    <div style={{ fontSize: 13, marginLeft: 10, marginBottom: -40 }}>
      (損失)
    </div>
    <LineChart
      xAxis={[{ scaleType: "point", data: xAxisData }]}
      yAxis={[{ min: 0 }]}
      series={[{ curve: "linear", data: selectValLosses, label: "検証データ 損失" }]}
      width={600}
      height={500}
    />
  </>);
}
