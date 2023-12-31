# 機械学習簡易体験Webシステム
https://mlexperience.onrender.com/

◆ システム概要  
ユーザがブラウザ上で機械学習(教師あり学習)のための入力データとモデルの設定を行い、機械学習の実行とその結果確認を簡易的に行えるWebシステム。

◆ 操作手順・機能概要  
① 「入力データ設定」において、機械学習に使用する入力データを選択し、DBからインポートする。  
② 入力データからターゲットを選択し、前処理を実行する(当システムでは簡易的な前処理が自動で行われる)。  
③ 「モデル設定」において、機械学習のモデルと各パラメータを設定する。  
　 必要であればパラメータを自動設定する(サーバのスペックが低いため、本環境では不可)。  
④ 「学習実行」において、機械学習を実行し、その結果を確認する。  

◆ 注意事項  
・画面レイアウトをスマホ向けには対応していないため、PCでのアクセスを推奨します。  
・サーバは一定時間アクセスがないとスリープ状態になります。  
　初回アクセス時や、しばらく時間を空けて操作した際、起動にしばらく時間がかかる場合があります。  
・サーバのスペックが低いため、ニューラルネットワークによる学習と、モデルのパラメータの自動設定はできません。  
　また、モデルの設定によっては処理限界を超過する場合があります。その際はモデルの設定を変更してください。  

◆ 構成・開発環境  
バックエンド： Python / Pytorch(lightning) / scikit-learn / Ray tune / FastAPI  
フロントエンド： React / TypeScript / Material-UI  
DB： PostgreSQL / pgAdmin  
その他： Docker / Render  

◆ フォルダ構成・ファイル概要  
backend/  
・App.py： バックエンドメイン。クライアントからのリクエストをWebAPIで受信し、対応する処理を実施する。  
・Define.py： 定義ファイル。汎用的な処理や定義を提供する。  
・Learning.py： 学習機能。リクエストされた学習方法に基づき、機械学習を行う。  
・Optimize.py： パラメータ自動設定機能。モデルの各パラメータを自動設定(最適化)する。  

frontend/src  
・App.py： フロントエンドメイン。  

frontend/src/components  
・SetInputData/： 「入力データ設定」のコンポーネント。「SetInputData.tsx」がメイン。  
・SetModel/： 「モデル設定」のコンポーネント。「SetModel.tsx」がメイン。  
・ExecLearning/： 「学習実行」のコンポーネント。「ExecLearning.tsx」がメイン。  
・Common/： 共通コンポーネント。トグルボタンやフェッチボタン等、各機能で共用するコンポーネント。  
・index.ts： コンポーネントのインデックスファイル。各コンポーネントおよび定義のエクスポートを行う。  
