# LoveLive! Choose

二択の比較を繰り返して、好きなキャラクター / キャストのランキングを作るアプリです。

## 技術スタック

- SolidJS 1.9 + TypeScript + Vite (最小構成)
- SUID (Solid 向けの Material UI 移植版)
- html-to-image (結果のPNG保存)

## 使い方

```bash
npm install
npm run dev      # 開発サーバー
npm run build    # 型チェック + dist/ に静的ファイルを出力
npm run preview  # ビルド結果の確認
npm run lint     # ESLint (--fix で自動修正)
npm test         # Vitest (test:watch で監視実行)
```

## 機能

- ソート対象の切り替え（キャラクター / キャスト）
- グループ単位・メンバー単位の対象選択
- 二択比較 + 「引き分け」（同順位として扱われます）
- 進捗バー
- 結果ランキングの絞り込み
  - 表示件数: 上位10 / 20 / 30 / すべて
  - グループ: 複数選択可（未選択時はすべて）。順位は絞り込み後も全体順位のまま表示します
- 結果ランキングの PNG 保存（同順位は `=` で表示。絞り込み条件は画像内の見出しにも記載されます）

## データの編集

`src/data/characters.json` を編集するだけでソート対象を変更できます。

```json
{
  "グループ名": [
    { "char": "キャラクター名", "cast": "キャスト名", "color": "#RRGGBB" }
  ]
}
```

### 既知の警告: Could not parse CSS stylesheet

SUID の Chip が `--xxxxx: & .MuiChip-deleteIcon` という宣言を出力しており
(`node_modules/@suid/material/Chip/Chip.jsx`)、jsdom が使う css-tree が
カスタムプロパティの値として `&` を解釈できないため、Chip を描画するたびに
「Could not parse CSS stylesheet」が出ていました。

- ブラウザではカスタムプロパティの値はほぼ任意のトークン列が許されるため実害はありません。
- jsdom の解析も tolerant で、この 1 宣言が無視されるだけでテスト結果にも影響しません。
- ログが埋もれるため、`src/test/setup.ts` でこの宣言を含むスタイルシートのエラーだけ通知を止めています。
  自分たちのスタイルの誤りは従来どおり報告されます。

SUID 側の記述が修正されたら、このフィルタは削除して構いません。
