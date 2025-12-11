# AI Chat - Anthropic Claude APIチャットボット

Anthropic Claude APIを使用した一般的な会話アシスタントチャットボットアプリケーション。Next.js App Router、Hono、Prisma、Mastraフレームワークを活用した、モダンで拡張性の高いフルスタックWebアプリケーションです。

## ✨ 主要機能

- 🤖 **AIチャット機能** - Claude APIによるリアルタイムストリーミング会話
- 💬 **会話履歴管理** - MongoDBによる会話の保存・管理
- 🌓 **ダークモード対応** - システム設定連動 & 手動切り替え
- 📱 **レスポンシブデザイン** - モバイル・タブレット・デスクトップ対応
- 🎨 **Markdownレンダリング** - コードブロックのシンタックスハイライト
- ⚡ **高速パフォーマンス** - Next.js 15の最新機能を活用

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS**
- **shadcn/ui** コンポーネント
- **next-themes** (ダークモード)

### バックエンド
- **Hono** - 軽量高速なWebフレームワーク
- **Prisma** - 型安全なORM
- **MongoDB** - NoSQLデータベース
- **Mastra** - AI統合フレームワーク
- **Anthropic Claude API** - AIモデル

### 開発・テスト
- **Vitest** - ユニットテスト
- **Playwright** - E2Eテスト
- **ESLint** & **Prettier** - コード品質管理

### デプロイ
- **Docker** - コンテナ化
- **Google Cloud Run** - サーバーレスデプロイ
- **GitHub Actions** - CI/CD

## 📋 前提条件

- Node.js 20.x以上
- npm または pnpm
- Docker Desktop (ローカル開発用)
- MongoDB (ローカル) または MongoDB Atlas (本番)
- Anthropic API キー

## 🚀 セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd ai-chat
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.example`を`.env`にコピーして、必要な値を設定：

```bash
cp .env.example .env
```

`.env`ファイルを編集：

```env
DATABASE_URL="mongodb://localhost:27017/ai-chat"
ANTHROPIC_API_KEY="your-api-key-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 4. MongoDBの起動（Docker使用）

**Replica Setとして起動（推奨）:**

```bash
# MongoDBコンテナを起動
docker run -d -p 27017:27017 --name mongodb mongo:latest --replSet rs0

# Replica Setを初期化
docker exec mongodb mongosh --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})"
```

### 5. Prismaのセットアップ

```bash
# Prisma Clientの生成
npx prisma generate

# データベーススキーマのプッシュ
npx prisma db push
```

### 6. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションが http://localhost:3000 で起動します。

## 🧪 テスト

### ユニットテスト

```bash
npm run test
```

### E2Eテスト

```bash
# MongoDB Replica Setが起動していることを確認
npm run test:e2e
```

### テストカバレッジ

```bash
npm run test:coverage
```

## 🐳 Docker

### ローカルでのDockerビルド

```bash
# イメージのビルド
docker build -f docker/Dockerfile -t ai-chat .

# コンテナの起動
docker run -p 3000:3000 \
  -e DATABASE_URL="your-mongodb-url" \
  -e ANTHROPIC_API_KEY="your-api-key" \
  ai-chat
```

## ☁️ Google Cloud Runへのデプロイ

### 前提条件

1. Google Cloud Projectの作成
2. gcloud CLIのインストールと認証
3. Cloud Run APIの有効化
4. Secret Managerへの環境変数登録

### Secret Managerへの登録

```bash
# APIキーの登録
echo -n "your-anthropic-api-key" | gcloud secrets create ANTHROPIC_API_KEY --data-file=-

# データベースURLの登録
echo -n "your-mongodb-atlas-url" | gcloud secrets create DATABASE_URL --data-file=-
```

### Cloud Buildでのデプロイ

```bash
gcloud builds submit --config=cloudbuild.yaml
```

### GitHub Actionsでのデプロイ

1. GitHubリポジトリのSecretsに以下を設定：
   - `GCP_PROJECT_ID`
   - `GCP_WORKLOAD_IDENTITY_PROVIDER`
   - `GCP_SERVICE_ACCOUNT`
   - `ANTHROPIC_API_KEY` (テスト用)

2. `main`ブランチにプッシュすると自動デプロイされます

## 📁 プロジェクト構造

```
ai-chat/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes (Hono)
│   │   ├── chat/              # チャット画面
│   │   └── layout.tsx         # ルートレイアウト
│   ├── components/            # Reactコンポーネント
│   │   ├── chat/             # チャット関連
│   │   ├── ui/               # 共通UI
│   │   └── providers/        # Context Providers
│   ├── hooks/                # カスタムフック
│   ├── lib/                  # ユーティリティ
│   │   ├── api/             # APIクライアント
│   │   ├── mastra/          # Mastra設定
│   │   └── prisma.ts        # Prisma Client
│   ├── server/              # バックエンドロジック
│   │   ├── api/            # Hono APIハンドラー
│   │   ├── services/       # ビジネスロジック
│   │   └── middleware/     # ミドルウェア
│   └── types/              # TypeScript型定義
├── prisma/
│   └── schema.prisma       # Prismaスキーマ
├── tests/                 # テストファイル
│   ├── unit/             # ユニットテスト
│   ├── integration/      # 統合テスト
│   └── e2e/              # E2Eテスト
├── docker/
│   └── Dockerfile        # Dockerファイル
└── .github/
    └── workflows/        # GitHub Actions
```

## 🔒 セキュリティ

- 環境変数の適切な管理
- XSS対策（Reactのデフォルト機能）
- MongoDB injection対策（Prisma使用）
- HTTPS強制（Cloud Run）
- API入力値のバリデーション（Zod）

## 📝 開発ガイドライン

### コーディング規約

- TypeScript strict mode使用
- ESLintとPrettierでコード品質管理
- Conventional Commits形式のコミットメッセージ
- 単一責任の原則に従った関数設計

### Gitコミット例

```bash
feat: 新機能の追加
fix: バグ修正
docs: ドキュメント更新
style: コードフォーマット
refactor: リファクタリング
test: テスト追加・修正
chore: その他の変更
```

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'feat: Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🙏 謝辞

- [Anthropic](https://www.anthropic.com/) - Claude API
- [Vercel](https://vercel.com/) - Next.js
- [Mastra](https://mastra.ai/) - AIフレームワーク
- [Hono](https://hono.dev/) - Webフレームワーク
- [Prisma](https://www.prisma.io/) - ORM

## 📮 サポート

問題が発生した場合は、GitHubのIssuesセクションで報告してください。

---

**バージョン**: 1.0.0
**最終更新**: 2025-12-11
