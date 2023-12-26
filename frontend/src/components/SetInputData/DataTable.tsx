/*****************************************************************************
 * 機能：データグリッド
 * 概要：データをデータグリッド形式で表示する。
 *****************************************************************************/
import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

export default function DataTable(props: {
  gridCol: GridColDef[];
  data: (string | number)[][];
}) {
  // 行データ設定
  const rows = props.data.map((dataRow: (string | number)[], index: number) => {
    // 「id」にインデックス値を設定
    const row: { [key: string]: string | number } = { id: index };
    // 「id」を除く各列のデータを設定
    props.gridCol.slice(1).forEach((col, colIndex) => {
      row[col.field] = dataRow[colIndex];
    });

    return row;
  });

  return (
    <div className="datagrid">
      <DataGrid
        rows={rows}
        columns={props.gridCol}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10, 20, 50, 100]}
        checkboxSelection
      />
    </div>
  );
}
