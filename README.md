# 𠮷田尚翔のポートフォリオ

就職向けポートフォリオの現在の制作版です。自己紹介 → NPO法人燈 → FRC Team Hanabi → Sonyとの共創 → コンタクトの順に紹介し、3活動には詳細ページを用意しています。

## ローカルで確認

Node.js 20以上。依存パッケージのインストールは不要です。

```sh
npm run pages
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

公開先: https://hotaru0223ki.github.io/HP/

Pagesの配信元は main の / (root) です。既存のPagesによるブランチ配信を使用します。追加の自動デプロイワークフローはありません。

npm run pages は /HP/ 用にビルド・検査し、dist/の中身9ファイルを配信元の直下へコピーします。index.html、3活動の詳細ページ、404.html、assets/、.nojekyllをコミット・pushしてください。READMEやソースを編集しても、配信ルートのHTMLを再生成しない限りサイトには反映されません。404の戻り先は /HP/ です。

2026-10-14: ビルド、全相互リンク・アンカー・メールリンク・静的生成範囲の検査を実施済み。掲載内容の補足や表現の見直しは継続できます。
