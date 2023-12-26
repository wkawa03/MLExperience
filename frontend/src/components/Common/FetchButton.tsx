/*****************************************************************************
 * 機能：フェッチボタン 共通コンポーネント
 * 概要：フェッチ処理を行う共通ボタンコンポーネント。
 *****************************************************************************/
import React, { useState, useContext } from "react";
import Button from "@mui/material/Button";
import { FetchImportProps, FetchPreprocProps, FetchLearningProps, CommonContext, ModelContext,
         OptimizeDialog, NnDetail, RfHparam, SvmHparam, KnnHparam,
         MODEL, LAYER, AF, MAX_FEATURES, FETCH_REQ } from "../index";

export default function FetchButton(props: {
    req: string;
    fetchImport?: FetchImportProps;
    fetchPreproc?: FetchPreprocProps;
    fetchLearning?: FetchLearningProps;
}) {
    // useStateを取得
    let { selectData, target } = useContext(CommonContext);
    const { SetSelectData, SetTarget, SetProblem, waitFetch, SetWaitFetch, SetFetchError } = useContext(CommonContext);
    const { model, nnDetails, SetNnDetail, nnHparam, SetNnHparam, optimizer, SetOptimizer,
            rfHparam, SetRfHparam, svmHparam, SetSvmHparam, knnHparam, SetKnnHparam } = useContext(ModelContext);

    // 最適化確認ダイアログ 表示フラグ
    const [optimizeDialog, SetOptimizeDialog] = useState(false);

    type Config = {
        buttonText: string; // ボタンテキスト
        GetArgFunc?: () => (string | number | boolean)[] | undefined; // 引数取得関数
        ResProcFunc: (resData: any) => void; // レスポンス受信処理関数
    }
    type ConfigMap = { [key: string]: Config; }

    const configMap: ConfigMap = {
        // インポート
        Import: {
            buttonText: "インポート",
            ResProcFunc: (resData) => props.fetchImport && props.fetchImport.SetInputDataVal
                                      && props.fetchImport.SetInputDataVal(resData.arg),
        },
        // 前処理
        Preproc: {
            buttonText: "前処理 実行",
            GetArgFunc: () => [target],
            ResProcFunc: (resData) => PreprocResProc(resData),
        },
        // 自動設定 (最適化)
        Optimize: {
            buttonText: "自動設定",
            GetArgFunc: () => [target, model],
            ResProcFunc: (resData) => OptimizeResProc(resData),
        },
        // 学習
        Learning: {
            buttonText: "学習 実行",
            GetArgFunc: () => GetLearningArg(),
            ResProcFunc: (resData) => LearningResProc(resData),
        },
    };
    // キーに対応するコンフィグを設定
    const { buttonText, GetArgFunc, ResProcFunc } = configMap[props.req] || [];

    // 前処理 レスポンス受信処理
    const PreprocResProc = (resData: any) => {
        // 前処理データ列名を設定
        props.fetchPreproc?.SetPreprocCols(resData.arg[0]);
        // 前処理データを設定
        props.fetchPreproc?.SetPreprocData(resData.arg[1]);
        // 前処理内容を設定
        props.fetchPreproc?.SetPreprocCont(resData.arg[2]);
        // 分析問題 (回帰／分類)を設定
        SetProblem(resData.arg[3]);

        // 前処理結果にスクロール
        const element = document.querySelector("#Preproc");
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    // 最適化 レスポンス受信処理
    const OptimizeResProc = (resData: any) => {
        // ニューラルネットワーク
        if (model === MODEL.nn) {
            // 詳細設定を取得・更新
            const newNnDetails: NnDetail[] = [];
            for (let idx = 1; idx <= 5; idx += 1) {
                newNnDetails.push({
                    last: (idx >= resData.arg.last),
                    layer: resData.arg[`layer${idx}`] as LAYER,
                    param: resData.arg[`param${idx}`] as number,
                    af: resData.arg[`af${idx}`] as AF,
                });

                if (newNnDetails[idx - 1].layer === LAYER.dropout) {
                    newNnDetails[idx - 1].param /= 100;
                }
            }
            SetNnDetail(newNnDetails);

            // 最適化アルゴリズムを設定
            SetOptimizer(resData.arg.optimizer);
            // ハイパーパラメータを設定
            SetNnHparam({ ...nnHparam, lr: resData.arg.lr, miniBatch: resData.arg.miniBatch });

        // ランダムフォレスト
        } else if (model === MODEL.rf) {
            // ハイパーパラメータを設定
            const newRfHparam: RfHparam = {
                nEstimators: resData.arg.n_estimators,
                maxFeatures: resData.arg.max_features ? resData.arg.max_features : MAX_FEATURES.none,
                maxDepth: resData.arg.max_depth ? resData.arg.max_depth : 0,
                minSamplesSplit: resData.arg.min_samples_split,
            };
            SetRfHparam(newRfHparam);

        // サポートベクターマシン
        } else if (model === MODEL.svm) {
            // ハイパーパラメータを設定
            const newSvmHparam: SvmHparam = {
                kernel: resData.arg.kernel,
                c: resData.arg.c,
                gamma: resData.arg.gamma !== "scale" ? resData.arg.gamma : 0,
            };
            SetSvmHparam(newSvmHparam);

        // k近傍法
        } else {
            // ハイパーパラメータを設定
            const newKnnHparam: KnnHparam = {
                nNeighbors: resData.arg.n_neighbors,
                weights: resData.arg.weights,
                algorithm: resData.arg.algorithm,
                metric: resData.arg.metric,
            };
            SetKnnHparam(newKnnHparam);
        }
    };

    // 学習実行 引数取得処理
    const GetLearningArg = () => {
        if (!props.fetchLearning) {
            return undefined;
        }

        // ニューラルネットワーク
        if (model === MODEL.nn) {
            const nnDetailsValues = Object.values(nnDetails).flatMap(
                (detail) => [detail.last, detail.layer, detail.param, detail.af],
            );
            const hParamValues = Object.values(nnHparam).map((value) => value);
            return [target, model,
                    ...nnDetailsValues, optimizer, ...hParamValues];
        }
        // ランダムフォレスト
        if (model === MODEL.rf) {
            const hParamValues = Object.values(rfHparam).map((value) => value);
            return [target, model, ...hParamValues];
        }
        // サポートベクターマシン
        if (model === MODEL.svm) {
            const hParamValues = Object.values(svmHparam).map((value) => value);
            return [target, model, ...hParamValues];
        }
        // k近傍法
        const hParamValues = Object.values(knnHparam).map((value) => value);
        return [target, model, ...hParamValues];
    };

    // 学習 レスポンス受信処理
    const LearningResProc = (resData: any) => {
        // ニューラルネットワーク
        if (model === MODEL.nn) {
            // 検証データ損失値を設定
            props.fetchLearning?.SetValLosses(resData.arg[0]);
            // 検証データ指標を設定
            props.fetchLearning?.SetValMetrics(resData.arg[1]);
            // テストデータ指標を設定
            props.fetchLearning?.SetTestMetrics(resData.arg[2]);
            // ターゲット予測値／正解値を設定
            props.fetchLearning?.SetTargetValues({ yPred: resData.arg[3][0], yTest: resData.arg[3][1] });
        } else {
            // テストデータ指標を設定
            props.fetchLearning?.SetTestMetrics(resData.arg[0]);
            // ターゲット予測値／正解値を設定
            props.fetchLearning?.SetTargetValues({ yPred: resData.arg[1][0], yTest: resData.arg[1][1] });
        }
    };

    // フェッチボタン クリック処理
    const FetchButtonClick = async () => {
        // インポートの場合、選択データを設定
        if (props.req === FETCH_REQ.Import) {
            if (props.fetchImport) {
                selectData = props.fetchImport.preSelectData;
                SetSelectData(props.fetchImport.preSelectData);
            }

        // 前処理の場合、選択ターゲットを設定
        } else if (props.req === FETCH_REQ.Preproc) {
            if (props.fetchPreproc) {
                target = props.fetchPreproc.preTarget;
                SetTarget(props.fetchPreproc.preTarget);
            }

        // 最適化の場合
        } else if (props.req === FETCH_REQ.Optimize) {
            // 最適化確認ダイアログを表示していない場合、表示して処理終了
            if (!optimizeDialog) {
                SetOptimizeDialog(true);
                return;
            }

            // 最適化確認ダイアログを閉じる
            SetOptimizeDialog(false);
        }

        // フェッチ送信データを設定
        type FetchSendData = {
            req: string; selectData: string;
            arg?: (string | number | boolean)[];
        }
        const fetchSendData: FetchSendData = { req: props.req, selectData };
        if (GetArgFunc) {
            fetchSendData.arg = GetArgFunc();
        }

        // フェッチ待ち状態を設定
        SetWaitFetch(props.req);
        // フェッチエラーをクリア
        SetFetchError("");

        try {
            // フェッチ処理
            const response = await fetch(process.env.REACT_APP_WEBAPI_URL as string, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(fetchSendData),
            });
            // レスポンス受信
            const resData = await response.json();

            // レスポンスを正しく受信できた場合、レスポンス受信処理を実行
            if (resData.res === props.req) {
                ResProcFunc(resData);

            // エラーメッセージ表示
            } else if (resData.res === `${FETCH_REQ.Learning} ValueError`) {
                SetFetchError(resData.res);
                FetchErrorLog(props.req, resData);
            } else {
                SetFetchError(props.req);
                FetchErrorLog(props.req, resData);
            }
        } catch (error) {
            SetFetchError(props.req);
            FetchErrorLog(props.req, error);
        } finally {
            // フェッチ待ち状態をクリア
            SetWaitFetch("");
        }
    };

    // 無効化条件
    const disabled = (waitFetch !== "")
                     || ((process.env.NODE_ENV === "production") && (props.fetchLearning) && (model === MODEL.nn));

    return (<>
        {/* 最適化確認ダイアログ */}
        <OptimizeDialog optimizeDialog={optimizeDialog} SetOptimizeDialog={SetOptimizeDialog} FetchButtonClick={FetchButtonClick} />
        {/* フェッチボタン */}
        <Button variant="contained" onClick={() => FetchButtonClick()} disabled={disabled} style={{ minWidth: 100 }}>
            <div className="text-def">{buttonText}</div>
        </Button>
    </>);
}


// 機能：フェッチエラー ログ出力処理
// 概要：フェッチ処理のエラー情報をログ出力する(開発時のみ)。
function FetchErrorLog(req: string, resData?: any, error?: unknown) {
    if (process.env.NODE_ENV === "development") {
        if (resData) {
            console.log(`${req} error:: res: ${resData.res} arg: ${resData.arg}`);
        } else {
            console.log(`${req} error:: error: ${error}`);
        }
    }
}
