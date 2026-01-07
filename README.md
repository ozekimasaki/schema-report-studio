# Schema Report Studio

URLからJSON-LD（構造化データ）を一括抽出し、クライアント向けレポート（HTML/PDF/CSV/JSON）として出力するツールです。

## 技術スタック
- Client: Vite 7 + React
- Server: Hono (Node)
- Worker: Cloudflare Workers（静的配信 + API）

## セットアップ（ローカル）
ターミナルを2つ使います。

### Server（Node）
```
cd server
npm install
npm run dev
```

### Client（Vite）
```
cd client
npm install
npm run dev
```

Client: http://localhost:5173  
Server: http://localhost:8787

## Cloudflare Workers（静的 + API）
1. Clientをビルド
```
cd client
npm install
npm run build
```
2. Workersをローカル実行
```
cd ../server
npm install
wrangler dev
```
3. デプロイ
```
wrangler deploy
```

### Worker設定
- 設定ファイル: `server/wrangler.jsonc`
- エントリ: `server/src/worker.js`
- 静的ファイル: `client/dist`

## 使い方
1. URLを1行ずつ入力
2. 「構造化データを抽出」をクリック
3. テンプレートを選択して、JSON/CSV/HTML/PDFで出力

## 補足
- JSON-LD / Microdata / RDFa に対応
- PDFはブラウザの印刷ダイアログから保存
- 1回のリクエスト上限: 200 URL
