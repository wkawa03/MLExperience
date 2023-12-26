/*****************************************************************************
 * 機能：ターゲットセレクタ
 * 概要：機械学習の仮選択ターゲットを選択する。
 *****************************************************************************/
import React, { useContext } from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { GridColDef } from "@mui/x-data-grid";
import { CommonContext } from "../index";

export default function SelectTarget(props: {
  inputGridCol: GridColDef[];
  preTarget: string;
  SetPreTarget: (value: string) => void;
}) {
  // useStateを取得
  const { selectData } = useContext(CommonContext);

  // 選択変更ハンドラ (仮選択ターゲットを更新)
  const HandleChange = (event: SelectChangeEvent) => {
    props.SetPreTarget(event.target.value as string);
  };

  return (
    <Box sx={{ minWidth: 150 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">ターゲット</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={props.preTarget}
          label="ターゲット"
          onChange={HandleChange}
        >
          {/* 先頭の「id」は共通して除外 */}
          { props.inputGridCol.slice(1).map((column: GridColDef) => {
            // 選択肢から除外する列の設定
            let excludeFields: string[];
            if (selectData === "titanic") {
              excludeFields = ["PassengerId", "Name", "Ticket", "Cabin"];
            } else if (selectData === "lego") {
              excludeFields = ["SetId", "Name", "Theme", "Subtheme"];
            } else {
              excludeFields = ["HouseId"];
            }

            // 除外対象の場合
            if (excludeFields.includes(column.field)) {
              return null;
            }
            // 選択肢を追加
            return <MenuItem key={column.field} value={column.field}>{column.headerName}</MenuItem>;
          })}
        </Select>
      </FormControl>
    </Box>
  );
}
