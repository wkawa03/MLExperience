/*****************************************************************************
 * 機能：最適化確認ダイアログ
 * 概要：最適化の実行を確認するダイアログ。
 *****************************************************************************/
import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function OptimizeDialog(props: {
  optimizeDialog: boolean;
  SetOptimizeDialog: (value: boolean) => void;
  FetchButtonClick: () => void;
}) {
  /* ダイアログクローズハンドラ */
  const HandleClose = () => {
    props.SetOptimizeDialog(false);
  };

  return (
    <Dialog
      open={props.optimizeDialog}
      onClose={HandleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        モデルの最適な設定を検索します
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          10～30分ほどかかります。完了後、自動で画面に反映されます。
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {/* OKボタンクリックで最適化フェッチ処理を実行 */}
        <Button onClick={props.FetchButtonClick}>OK</Button>
        <Button onClick={HandleClose} autoFocus>キャンセル</Button>
      </DialogActions>
    </Dialog>
  );
}
