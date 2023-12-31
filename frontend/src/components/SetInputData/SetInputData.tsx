/*****************************************************************************
 * 機能：入力データ設定 メイン
 * 概要：機械学習を行うデータおよびターゲットを選択し、前処理を実行する。
 *****************************************************************************/
import React, { useState, useEffect, useContext } from "react";
import "../../style.css";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import { GridColDef } from "@mui/x-data-grid";
import { CommonContext, CommonTButton, FetchButton, DataTable, SelectTarget,
         CONFIG_KEY, INPUT_DATA, FETCH_REQ, tooltipML } from "../index";

export default function SetInputData(props: {
  preprocData: (string | number)[][];
  SetPreprocData: (value: (string | number)[][]) => void;
}) {
  // useStateを取得
  const { selectData, waitFetch, fetchError } = useContext(CommonContext);

  // 仮選択入力データ
  const [preSelectData, SetPreSelectData] = useState(INPUT_DATA.titanic);
  // 仮選択ターゲット
  const [preTarget, SetPreTarget] = useState("");

  // データグリッド列定義
  // タイタニック号 乗客リスト
  const titanicGridCol: GridColDef[] = [
    { field: "id", headerName: "No.", type: "number", width: 100 },
    { field: "PassengerId", headerName: "乗客ID", type: "number", width: 100 },
    { field: "Survived", headerName: "生存", type: "number", width: 100 },
    { field: "Pclass", headerName: "チケットクラス", type: "number", width: 150 },
    { field: "Name", headerName: "氏名", width: 300 },
    { field: "Sex", headerName: "性別", width: 100 },
    { field: "Age", headerName: "年齢", type: "number", width: 100 },
    { field: "SibSp", headerName: "同乗の兄弟・配偶者の数", type: "number", width: 230 },
    { field: "Parch", headerName: "同乗の親子の数", type: "number", width: 150 },
    { field: "Ticket", headerName: "チケット番号", width: 150 },
    { field: "Fare", headerName: "運賃", type: "number", width: 100 },
    { field: "Cabin", headerName: "客室番号", width: 100 },
    { field: "Embarked", headerName: "乗船港", width: 100 },
  ];
  // レゴブロック
  const legoGridCol: GridColDef[] = [
    { field: "id", headerName: "No.", type: "number", width: 100 },
    { field: "SetId", headerName: "セットID", width: 100 },
    { field: "Name", headerName: "商品名", width: 200 },
    { field: "Year", headerName: "発売年", type: "number", width: 100 },
    { field: "Theme", headerName: "テーマ", width: 200 },
    { field: "ThemeGroup", headerName: "テーマグループ", width: 200 },
    { field: "Subtheme", headerName: "サブテーマ", width: 200 },
    { field: "Category", headerName: "カテゴリ", width: 100 },
    { field: "Packaging", headerName: "包装", width: 150 },
    { field: "NumInstructions", headerName: "説明書の数", type: "number", width: 110 },
    { field: "Availability", headerName: "取扱店", width: 150 },
    { field: "Pieces", headerName: "ピース数", type: "number", width: 100 },
    { field: "Minifigures", headerName: "ミニフィギュア数", type: "number", width: 160 },
    { field: "Owned", headerName: "所有数", type: "number", width: 100 },
    { field: "Rating", headerName: "評価", type: "number", width: 100 },
    { field: "UsdMsrp", headerName: "希望小売価格(USD)", type: "number", width: 200 },
    { field: "TotalQuantity", headerName: "総量", type: "number", width: 100 },
    { field: "CurrentPrice", headerName: "現在価格(USD)", type: "number", width: 150 },
  ];
  // 住宅情報
  const houseGridCol: GridColDef[] = [
    { field: "id", headerName: "No.", type: "number", width: 100 },
    { field: "HouseId", headerName: "住宅ID", type: "number", width: 100 },
    { field: "MSSubClass", headerName: "住宅タイプ", width: 150 },
    { field: "MSZoning", headerName: "区域", width: 100 },
    { field: "LotFrontage", headerName: "敷地の道路に接する長さ", type: "number", width: 200 },
    { field: "LotArea", headerName: "敷地面積", type: "number", width: 100 },
    { field: "Street", headerName: "敷地への道路タイプ", width: 200 },
    { field: "Alley", headerName: "敷地への路地タイプ", width: 200 },
    { field: "LotShape", headerName: "形状", width: 100 },
    { field: "LandContour", headerName: "敷地の平坦度", width: 150 },
    { field: "Utilities", headerName: "公共設備", width: 100 },
    { field: "LotConfig", headerName: "ロット構成", width: 150 },
    { field: "LandSlope", headerName: "敷地の傾き", width: 150 },
    { field: "Neighborhood", headerName: "近隣地域", width: 200 },
    { field: "Condition1", headerName: "条件1", width: 100 },
    { field: "Condition2", headerName: "条件2", width: 100 },
    { field: "BldgType", headerName: "住居タイプ", width: 150 },
    { field: "HouseStyle", headerName: "住居スタイル", width: 150 },
    { field: "OverallQual", headerName: "全体品質", type: "number", width: 100 },
    { field: "OverallCond", headerName: "全体の状態", type: "number", width: 150 },
    { field: "YearBuilt", headerName: "建築年", type: "number", width: 100 },
    { field: "YearRemodAdd", headerName: "改築年", type: "number", width: 100 },
    { field: "RoofStyle", headerName: "屋根スタイル", width: 150 },
    { field: "RoofMatl", headerName: "屋根素材", width: 150 },
    { field: "Exterior1st", headerName: "外装材1", width: 100 },
    { field: "Exterior2nd", headerName: "外装材2", width: 100 },
    { field: "MasVnrType", headerName: "石積みベニヤタイプ", width: 200 },
    { field: "MasVnrArea", headerName: "石積みベニヤ面積", type: "number", width: 200 },
    { field: "ExterQual", headerName: "外装品質", width: 150 },
    { field: "ExterCond", headerName: "外装状態", width: 150 },
    { field: "Foundation", headerName: "塗材", width: 100 },
    { field: "BsmtQual", headerName: "地下室品質", width: 150 },
    { field: "BsmtCond", headerName: "地下室状態", width: 150 },
    { field: "BsmtExposure", headerName: "地下室露出", width: 150 },
    { field: "BsmtFinType1", headerName: "地下室タイプ1", width: 150 },
    { field: "BsmtFinSF1", headerName: "地下室面積1", type: "number", width: 150 },
    { field: "BsmtFinType2", headerName: "地下室タイプ2", width: 150 },
    { field: "BsmtFinSF2", headerName: "地下室面積2", type: "number", width: 150 },
    { field: "BsmtUnfSF", headerName: "未完成の地下室面積", type: "number", width: 150 },
    { field: "TotalBsmtSF", headerName: "地下室合計面積", type: "number", width: 150 },
    { field: "Heating", headerName: "暖房", width: 150 },
    { field: "HeatingQC", headerName: "暖房の品質と状態", width: 150 },
    { field: "CentralAir", headerName: "空調", width: 100 },
    { field: "Electrical", headerName: "電気", width: 100 },
    { field: "1stFlrSF", headerName: "1階面積", type: "number", width: 100 },
    { field: "2ndFlrSF", headerName: "2階面積", type: "number", width: 100 },
    { field: "LowQualFinSF", headerName: "低品質面積", type: "number", width: 150 },
    { field: "GrLivArea", headerName: "地上住居面積", type: "number", width: 150 },
    { field: "BsmtFullBath", headerName: "地下浴室面積", type: "number", width: 150 },
    { field: "BsmtHalfBath", headerName: "地下洗面所面積", type: "number", width: 200 },
    { field: "FullBath", headerName: "浴室面積", type: "number", width: 100 },
    { field: "HalfBath", headerName: "洗面所面積", type: "number", width: 150 },
    { field: "BedroomAbvGr", headerName: "寝室面積", type: "number", width: 100 },
    { field: "KitchenAbvGr", headerName: "キッチン面積", type: "number", width: 150 },
    { field: "KitchenQual", headerName: "キッチン品質", width: 150 },
    { field: "TotRmsAbvGrd", headerName: "部屋面積", type: "number", width: 100 },
    { field: "Functional", headerName: "機能性", width: 100 },
    { field: "Fireplaces", headerName: "暖炉数", type: "number", width: 100 },
    { field: "FireplaceQu", headerName: "暖炉品質", width: 100 },
    { field: "GarageType", headerName: "ガレージタイプ", width: 150 },
    { field: "GarageYrBlt", headerName: "ガレージ建築年", type: "number", width: 150 },
    { field: "GarageFinish", headerName: "ガレージ仕上げ", width: 150 },
    { field: "GarageCars", headerName: "ガレージ台数", type: "number", width: 150 },
    { field: "GarageArea", headerName: "ガレージ面積", type: "number", width: 150 },
    { field: "GarageQual", headerName: "ガレージ品質", width: 150 },
    { field: "GarageCond", headerName: "ガレージ状態", width: 150 },
    { field: "PavedDrive", headerName: "私道", width: 100 },
    { field: "WoodDeckSF", headerName: "ウッドデッキ面積", type: "number", width: 150 },
    { field: "OpenPorchSF", headerName: "屋外縁側面積", type: "number", width: 150 },
    { field: "EnclosedPorch", headerName: "屋内縁側面積", type: "number", width: 150 },
    { field: "3SsnPorch", headerName: "3シーズン対応縁側面積", type: "number", width: 200 },
    { field: "ScreenPorch", headerName: "遮蔽縁側面積", type: "number", width: 150 },
    { field: "PoolArea", headerName: "プール面積", type: "number", width: 150 },
    { field: "PoolQC", headerName: "プールの品質と状態", width: 200 },
    { field: "Fence", headerName: "フェンス", width: 100 },
    { field: "MiscFeature", headerName: "その他機能", width: 150 },
    { field: "MiscVal", headerName: "その他機能の価値", type: "number", width: 200 },
    { field: "MoSold", headerName: "売却月", type: "number", width: 100 },
    { field: "YrSold", headerName: "売却年", type: "number", width: 100 },
    { field: "SaleType", headerName: "販売タイプ", width: 150 },
    { field: "SaleCondition", headerName: "販売条件", width: 100 },
    { field: "SalePrice", headerName: "販売価格", type: "number", width: 100 },
  ];
  // 入力データ列情報
  const [inputGridCol, SetInputGridCol] = useState(titanicGridCol);

  // 入力データ
  const [inputData, SetInputDataVal] = useState<(string | number)[][]>([]);
  useEffect(() => {
    // 入力データが変化した場合、入力データ列名および仮選択ターゲットを初期化
    if (selectData === INPUT_DATA.titanic) {
      SetInputGridCol(titanicGridCol);
      SetPreTarget("Survived");
    } else if (selectData === INPUT_DATA.lego) {
      SetInputGridCol(legoGridCol);
      SetPreTarget("CurrentPrice");
    } else {
      SetInputGridCol(houseGridCol);
      SetPreTarget("SalePrice");
    }
    // 前処理データをクリア
    props.SetPreprocData([]);
  }, [inputData]);

  useEffect(() => {
    // 選択データが変化した場合、入力データをクリア
    SetInputDataVal([]);
  }, [selectData]);

  // 前処理データ 列名
  const [preprocCols, SetPreprocCols] = useState([""]);
  useEffect(() => {
    // 前処理データ 列名が変化した場合、前処理データ 列情報を設定
    const gridCols = preprocCols.map((column: string) => {
      // 入力データに同一列が存在する場合、その設定を使用
      const GridCol = inputGridCol.find((col) => col.field === column);
      if (GridCol !== undefined) {
        GridCol.type = "number";
        return GridCol;
      }

      type Translations = { [key: string]: string; }
      let translations: Translations;
      let width = 100;

      // 追加された列の設定
      // タイタニック号 乗客リスト
      if (selectData === INPUT_DATA.titanic) {
        // 翻訳
        translations = {
          Embarked: "乗船港", Title: "敬称", AgeBin: "年齢ビン", FamilySize: "自分を含む同乗の家族の人数", FareBin: "運賃ビン", Deck: "甲板",
        };
        // 横幅
        if (column === "FamilySize") {
          width = 230;
        }

      // レゴブロック
      } else if (selectData === INPUT_DATA.lego) {
        translations = {
          ThemeGroup: "テーマグループ", Category: "カテゴリ", Packaging: "包装", Availability: "取扱店",
          YearBin: "発売年ビン", PiecesBin: "ピース数ビン", OwnedBin: "所有数ビン", RatingBin: "評価ビン", UsdMsrpBin: "希望小売価格ビン",
          TotalQuantityBin: "総量ビン", CurrentPriceBin: "現在価格ビン",
        };
        if ((column === "YearBin") || (column === "PiecesBin") || (column === "OwnedBin") || (column === "CurrentPriceBin")) {
          width = 150;
        } else if ((column.startsWith("ThemeGroup")) || (column.startsWith("Category")) || (column.startsWith("Packaging"))
                   || (column.startsWith("Availability")) || (column.startsWith("UsdMsrp"))) {
          width = 200;
        }

      // 住宅情報
      } else {
        translations = {};
      }

      // "_"区切り先頭の名称を翻訳
      const parts = column.split("_");
      parts[0] = translations[parts[0]] || parts[0];
      const headerName = parts.join("_");

      return { field: column, headerName, type: "number", width };
    });
    // id列を先頭に追加
    gridCols.unshift({ field: "id", headerName: "No.", type: "number", width: 100 });

    // 前処理データ 列情報を設定
    SetPreprocGridCol(gridCols);
  }, [preprocCols]);

  // 前処理データ 列情報
  const [preprocGridCol, SetPreprocGridCol] = useState<GridColDef[]>([]);
  // 前処理内容
  const [preprocCont, SetPreprocCont] = useState([""]);

  // ツールチップ説明文
  const tooltipTarget = "予測の対象とする情報のこと。例えば「タイタニック号 乗客リスト」において「生存」列をターゲットとした場合、ターゲット以外の情報から「生存」列の値を予測する。ターゲットにできない情報は選択不可。";
  const tooltipPreproc = "入力データをより分析し易くし、予測性能の向上に繋がるデータに変換すること。当システムでは簡易的な前処理のみ行う。";
  const tooltipNan = "データに何も入力されていない無効な値のこと。主な処置方法は、同じデータの平均値・中央値(データを昇順に並べた際の中央に位置する値)・最頻値(最も頻出する値)のいずれかを設定するか、欠損値を含む行を削除する。";
  const tooltipBin = "データを値の範囲でグループ化すること。例えば「年齢」の数値が設定されたデータを0～9歳、10～19歳、20～39歳などにグループ化する。これによりデータを簡素化し、分析し易くする。";
  const tooltipIndex = "データの分類毎に数値を割り当てた値のこと。例えば「犬・猫・馬」という分類を持つデータに、「0・1・2」といった数値を割り当てる。";
  const tooltipOneHot = "データの分類毎に列を定義し、該当する列の値に「1」、それ以外に「0」を設定する手法。"
                        + "例えば「犬・猫・馬」という分類を持つ「動物」列に対して3列定義し、データが「犬」である行は「動物_犬」列に「1」、「動物_猫・動物_馬」列に「0」を設定する。"
                        + "なお「動物_猫・動物_馬」列が「0」＝「動物_犬」列が「1」と判断できるため、1列少なく定義する場合もある。"
                        + "同様のデータをインデックス値としても表現できるが、その場合に数値の大小などの関係を誤って解釈されることを防ぐ。";

  return (<>
    <h1>入力データ設定</h1>

    <div className="frame">
      <div id="DataImport" className="grid-def">
        <Tooltip title={tooltipML} placement="bottom-start">
          <div className="text-UL">機械学習</div>
        </Tooltip>
        <div className="text-def">を行うデータを選択し、インポートしてください。</div>
      </div>

      <div className="text-def margin-sentence">
        ※下線付きのワードにポインタを合わせると、説明が表示されます。
      </div>

      <div className="grid-def margin-cont" style={{ columnGap: 30 }}>
        {/* 入力データ仮選択 */}
        <CommonTButton configKey={CONFIG_KEY.inputData} preSelectDataUS={{ preSelectData, SetPreSelectData }} />
        {/* インポートボタン */}
        <FetchButton req={FETCH_REQ.Import} fetchImport={{ preSelectData, SetInputDataVal }} />
        {/* インポート中プログレス */}
        {(waitFetch === FETCH_REQ.Import) && (<CircularProgress />)}
        {/* インポートエラーメッセージ */}
        {(fetchError === FETCH_REQ.Import) && (
          <div className="text-def" style={{ color: "red" }}>サーバとの通信エラーが発生しました。しばらく待って再度実行してください。</div>
        )}
      </div>

      {/* 入力データが設定されている場合に表示 */}
      {(inputData.length > 0) && (<>
        {/* 入力データ データグリッド */}
        <div className="margin-cont"><DataTable gridCol={inputGridCol} data={inputData} /></div>

        <div id="Preproc" className="separator-line" />

        <div className="grid-def">
          <Tooltip title={tooltipTarget} placement="bottom-start">
            <div className="text-UL">ターゲット</div>
          </Tooltip>
          <div className="text-def">の列を選択して、</div>
          <Tooltip title={tooltipPreproc} placement="bottom-start">
            <div className="text-UL">前処理</div>
          </Tooltip>
          <div className="text-def">を行ってください。</div>
        </div>

        <div className="grid-def margin-cont" style={{ columnGap: 30 }}>
          {/* ターゲット仮選択 */}
          <SelectTarget inputGridCol={inputGridCol} preTarget={preTarget} SetPreTarget={SetPreTarget} />
          {/* 前処理実行ボタン */}
          <FetchButton req={FETCH_REQ.Preproc} fetchPreproc={{ preTarget, SetPreprocCols, SetPreprocData: props.SetPreprocData, SetPreprocCont }} />
          {/* 前処理中プログレス */}
          {(waitFetch === FETCH_REQ.Preproc) && (<CircularProgress />)}
          {/* 前処理エラーメッセージ */}
          {(fetchError === FETCH_REQ.Preproc) && (
            <div className="text-def" style={{ color: "red" }}>サーバとの通信エラーが発生しました。しばらく待って再度実行してください。</div>
          )}
        </div>

        { props.preprocData.length > 0 && (<>
          <div className="text-def margin-cont">
            ※各用語の説明は以下を参照してください。
          </div>
          <div className="grid-def" style={{ columnGap: 20 }}>
            <Tooltip title={tooltipNan} placement="bottom-start">
              <div className="text-UL">欠損値</div>
            </Tooltip>
            <Tooltip title={tooltipBin} placement="bottom-start">
              <div className="text-UL">ビン</div>
            </Tooltip>
            <Tooltip title={tooltipIndex} placement="bottom-start">
              <div className="text-UL">インデックス値</div>
            </Tooltip>
            <Tooltip title={tooltipOneHot} placement="bottom-start">
              <div className="text-UL">ワンホットエンコーディング</div>
            </Tooltip>
          </div>

          <div className="text-def margin-cont">
            前処理結果
            <div style={{ height: 120, maxWidth: 800, overflowY: "scroll" }}>
              {/* 前処理内容を表示 */}
              { preprocCont.map((item, index) => (
                <div key={index}>{item}</div>
              ))}
            </div>
          </div>

          {/* 前処理データ データグリッド */}
          <div className="margin-cont"><DataTable gridCol={preprocGridCol} data={props.preprocData} /></div>
        </>)}
      </>)}
    </div>
  </>);
}
