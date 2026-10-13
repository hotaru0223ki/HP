# 𠮷田尚翔のポートフォリオ

就職向けポートフォリオの現在の制作版です。自己紹介 → NPO法人燈 → FRC Team Hanabi → Sonyとの共創 → コンタクトの順に紹介し、3活動には詳細ページを用意しています。

## ローカルで確認

Node.js 20以上。依存パッケージのインストールは不要です。

```sh
SITE_BASE_PATH=/HP/ npm run build
npm run check
npm run preview
```

http://127.0.0.1:4173/ を開きます。停止はCtrl+C。生成済みの dist/index.html をブラウザで直接開くこともできます。

## 編集する場所

- 紹介文・参照リンク: content/site/*.md
- 共通レイアウト: src/index.html、src/404.html
- 配色・角丸・文字組み: src/assets/styles.css
- ナビゲーション: src/assets/navigation.js
- 冒頭の図: src/assets/intro-index.svg
- 生成済みサイト: dist/
- サイトが参照する公開資料: docs/CONTENT_INVENTORY.md

原稿は先頭のタイトル、既存の項目名、段落、リンクの形式を維持して編集してください。編集後はビルドと検査を行います。

## GitHub Pagesについて

このリポジトリへの保存のみを行っています。Pagesの有効化や自動デプロイ用のワークフローは追加していません。

配信対象は dist/ の中身です。Pagesのブランチ配信はルートまたは docs フォルダを選ぶ方式なので、dist/ を直接選ぶことはできません。後で公開する場合は専用配信ブランチかActionsを用意してください。404の戻り先は /HP/ として生成しています。

2026-10-14: ビルド、全相互リンク・アンカー・メールリンク・静的生成範囲の検査を実施済み。掲載内容の補足や表現の見直しは継続できます。
