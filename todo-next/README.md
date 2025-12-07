# TODOリストアプリケーション

Next.js、TypeScript、Tailwind CSSを使用して作成したTODOリストアプリケーションです。

## 機能

- タスクの追加
- タスクの完了/未完了の切り替え
- タスクの削除
- 完了数の表示
- レスポンシブデザイン

## 技術スタック

- Next.js 15
- React 19
- TypeScript (strict mode)
- Tailwind CSS
- Jest & React Testing Library

## 開発方針

- テスト駆動開発(TDD)で実装
- TypeScript strict mode を有効化
- 単一責任の原則に従った関数設計

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ブラウザで http://localhost:3000 にアクセス
```

## テスト

```bash
# テストの実行
npm test

# テストのwatch モード
npm run test:watch
```

## ビルド

```bash
# プロダクションビルド
npm run build

# ビルドの起動
npm start
```

## プロジェクト構成

```
todo-next/
├── app/
│   ├── globals.css       # グローバルスタイル
│   ├── layout.tsx        # ルートレイアウト
│   └── page.tsx          # メインページ
├── components/
│   ├── TodoItem.tsx      # TODOアイテムコンポーネント
│   ├── TodoItem.test.tsx # TODOアイテムのテスト
│   ├── TodoList.tsx      # TODOリストコンポーネント
│   └── TodoList.test.tsx # TODOリストのテスト
└── types/
    └── todo.ts           # TODO型定義
```

## ライセンス

MIT
