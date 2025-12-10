# AIチャットボット 実装計画

**プロジェクト**: ai-chat
**作成日**: 2025-12-10
**実装方式**: テスト駆動開発（TDD）

---

## 📋 実装フェーズ概要

- **Phase 0**: プロジェクト初期セットアップ
- **Phase 1**: データベース・インフラ設定
- **Phase 2**: バックエンドAPI実装
- **Phase 3**: フロントエンド実装
- **Phase 4**: テスト実装・品質保証
- **Phase 5**: デプロイ準備

---

## Phase 0: プロジェクト初期セットアップ ✅

### 0.1 開発環境構築

- [x] Node.js (v20+) のインストール確認
- [x] pnpm または npm のセットアップ
- [x] Git リポジトリの初期化（既存の場合は確認）
- [x] `.gitignore` の設定
  - `node_modules/`
  - `.env.local`
  - `.next/`
  - `dist/`
  - `coverage/`

### 0.2 Next.js プロジェクト初期化

- [x] Next.js プロジェクトの作成（App Router）
  ```bash
  npx create-next-app@latest ai-chat --typescript --tailwind --app --src-dir
  ```
- [x] TypeScript strict モード有効化
  - `tsconfig.json` で `"strict": true` を確認
- [x] ESLint と Prettier の設定
  ```bash
  npm install -D prettier eslint-config-prettier
  ```
- [x] `.prettierrc` の作成
- [x] `.eslintrc.json` の調整

### 0.3 依存パッケージのインストール

#### コア依存関係
- [x] Hono のインストール
  ```bash
  npm install hono
  ```
- [x] Prisma のインストール
  ```bash
  npm install @prisma/client
  npm install -D prisma
  ```
- [x] Mastra のインストール
  ```bash
  npm install mastra@beta @mastra/core@beta @ai-sdk/anthropic
  ```

#### UI/UX ライブラリ
- [x] shadcn/ui のセットアップ（基本ライブラリインストール済み）
  ```bash
  npm install next-themes react-markdown remark-gfm rehype-highlight
  ```
- [x] 必要なUIコンポーネントのインストール（後のフェーズで実装）
- [x] Markdown レンダリング
  ```bash
  npm install react-markdown remark-gfm rehype-highlight
  ```
- [x] ダークモード対応
  ```bash
  npm install next-themes
  ```

#### 開発・テストツール
- [x] Vitest のインストール
  ```bash
  npm install -D vitest @vitest/ui
  npm install -D @testing-library/react @testing-library/jest-dom
  npm install -D @vitejs/plugin-react
  ```
- [x] Playwright のインストール
  ```bash
  npm install -D @playwright/test
  npx playwright install
  ```
- [x] Supertest のインストール
  ```bash
  npm install -D supertest @types/supertest
  ```

#### バリデーション・ユーティリティ
- [x] Zod のインストール
  ```bash
  npm install zod
  ```
- [x] date-fns または dayjs
  ```bash
  npm install date-fns
  ```

### 0.4 プロジェクト構造の作成

- [x] ディレクトリ構造を作成
  ```bash
  mkdir -p src/app/api/[...route]
  mkdir -p src/app/chat/[id]
  mkdir -p src/components/{chat,ui,providers}
  mkdir -p src/lib/{api,mastra}
  mkdir -p src/server/{api/routes,services,middleware}
  mkdir -p src/types
  mkdir -p tests/{unit,integration,e2e}
  mkdir -p prisma
  mkdir -p docker
  ```

### 0.5 設定ファイルの作成

- [x] `.env.example` の作成
  ```env
  DATABASE_URL="mongodb://localhost:27017/ai-chat"
  ANTHROPIC_API_KEY="sk-ant-xxx"
  NEXT_PUBLIC_APP_URL="http://localhost:3000"
  NODE_ENV="development"
  ```
- [x] `vitest.config.ts` の作成
- [x] `playwright.config.ts` の作成
- [x] `next.config.js` の最適化設定

---

## Phase 1: データベース・インフラ設定 ✅

### 1.1 MongoDB セットアップ

- [x] ローカル MongoDB のインストール（Docker推奨）
  ```bash
  docker run -d -p 27017:27017 --name mongodb mongo:latest
  ```
  ⚠️ 注: Docker Desktop起動後に実行が必要
- [ ] MongoDB Atlas アカウント作成（本番環境用）
- [x] DATABASE_URL の設定

### 1.2 Prisma セットアップ

- [x] Prisma 初期化
  ```bash
  npx prisma init --datasource-provider mongodb
  ```
- [x] `prisma/schema.prisma` にスキーマ定義を作成
  ```prisma
  model Conversation {
    id        String   @id @default(auto()) @map("_id") @db.ObjectId
    title     String?
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    messages  Message[]
  }

  model Message {
    id             String       @id @default(auto()) @map("_id") @db.ObjectId
    conversationId String       @db.ObjectId
    conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
    role           String
    content        String
    createdAt      DateTime     @default(now())

    @@index([conversationId])
  }
  ```
- [x] Prisma クライアント生成
  ```bash
  npx prisma generate
  ```
- [ ] データベースのプッシュ（Docker起動後に実行）
  ```bash
  npx prisma db push
  ```

### 1.3 Prisma クライアントのシングルトン作成

- [x] `src/lib/prisma.ts` の実装
  ```typescript
  import { PrismaClient } from '@prisma/client'

  const globalForPrisma = global as unknown as { prisma: PrismaClient }

  export const prisma = globalForPrisma.prisma || new PrismaClient()

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
  ```

### 1.4 Seed データの作成（オプション）

- [x] `prisma/seed.ts` の作成
- [x] package.json に seed スクリプト追加
  ```json
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
  ```

---

## Phase 2: バックエンドAPI実装 ✅

### 2.1 型定義の作成（TDD準備）

- [x] `src/types/index.ts` に共通型定義
  ```typescript
  export type MessageRole = 'user' | 'assistant' | 'system'

  export interface Message {
    id: string
    conversationId: string
    role: MessageRole
    content: string
    createdAt: Date
  }

  export interface Conversation {
    id: string
    title?: string
    createdAt: Date
    updatedAt: Date
    messages: Message[]
  }

  export interface ChatRequest {
    conversationId?: string
    message: string
  }

  export interface StreamChunk {
    type: 'start' | 'text' | 'end' | 'error'
    content?: string
    messageId?: string
    error?: string
  }
  ```

### 2.2 Mastra 設定

- [x] `src/lib/mastra/config.ts` の実装
  ```typescript
  import { Mastra } from '@mastra/core'
  import { Anthropic } from '@mastra/anthropic'

  export const mastra = new Mastra({
    providers: {
      anthropic: new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY!,
        model: 'claude-3-5-sonnet-20241022',
      }),
    },
  })
  ```

### 2.3 AIサービスの実装（TDD）

**テストファースト:**
- [ ] `tests/unit/services/aiService.test.ts` を作成（後で実装）
  - ストリーミング応答のテスト
  - エラーハンドリングのテスト
  - 会話履歴のテスト

**実装:**
- [x] `src/server/services/aiService.ts` の実装
  ```typescript
  import { mastra } from '@/lib/mastra/config'
  import type { Message } from '@/types'

  export class AIService {
    async generateStreamingResponse(
      conversationHistory: Array<{ role: string; content: string }>,
      onChunk: (chunk: string) => void
    ): Promise<void> {
      // Mastra を使ったストリーミング実装
    }
  }
  ```

**テスト実行:**
- [ ] テストが通ることを確認
  ```bash
  npm run test -- tests/unit/services/aiService.test.ts
  ```

### 2.4 会話サービスの実装（TDD）

**テストファースト:**
- [ ] `tests/unit/services/conversationService.test.ts` を作成（後で実装）
  - 会話の作成テスト
  - 会話の取得テスト
  - メッセージの追加テスト
  - 会話の削除テスト

**実装:**
- [x] `src/server/services/conversationService.ts` の実装
  ```typescript
  import { prisma } from '@/lib/prisma'
  import type { Conversation, Message } from '@/types'

  export class ConversationService {
    async createConversation(title?: string): Promise<Conversation>
    async getConversation(id: string): Promise<Conversation | null>
    async listConversations(): Promise<Conversation[]>
    async addMessage(conversationId: string, role: string, content: string): Promise<Message>
    async deleteConversation(id: string): Promise<void>
    async updateConversationTitle(id: string, title: string): Promise<Conversation>
  }
  ```

**テスト実行:**
- [ ] テストが通ることを確認

### 2.5 Hono API ルートの実装

**ミドルウェアの作成:**
- [x] `src/server/middleware/errorHandler.ts` - エラーハンドリング
- [x] `src/server/middleware/cors.ts` - CORS設定
- [ ] `src/server/middleware/rateLimit.ts` - レート制限（オプション・後で実装）

**チャットAPIの実装（TDD）:**
- [ ] `tests/integration/api/chat.test.ts` を作成（後で実装）
  - POST /api/chat のテスト
  - ストリーミングレスポンスのテスト

- [x] `src/server/api/routes/chat.ts` の実装
  ```typescript
  import { Hono } from 'hono'
  import { stream } from 'hono/streaming'
  import { AIService } from '@/server/services/aiService'
  import { ConversationService } from '@/server/services/conversationService'

  const chat = new Hono()

  chat.post('/', async (c) => {
    // ストリーミングチャット実装
  })

  export default chat
  ```

**会話管理APIの実装（TDD）:**
- [ ] `tests/integration/api/conversations.test.ts` を作成（後で実装）
  - GET /api/conversations のテスト
  - POST /api/conversations のテスト
  - GET /api/conversations/:id のテスト
  - DELETE /api/conversations/:id のテスト
  - PATCH /api/conversations/:id のテスト

- [x] `src/server/api/routes/conversations.ts` の実装
  ```typescript
  import { Hono } from 'hono'
  import { ConversationService } from '@/server/services/conversationService'

  const conversations = new Hono()

  conversations.get('/', async (c) => { /* 一覧取得 */ })
  conversations.post('/', async (c) => { /* 新規作成 */ })
  conversations.get('/:id', async (c) => { /* 詳細取得 */ })
  conversations.delete('/:id', async (c) => { /* 削除 */ })
  conversations.patch('/:id', async (c) => { /* 更新 */ })

  export default conversations
  ```

**メインAPIハンドラーの作成:**
- [x] `src/server/api/index.ts` の実装
  ```typescript
  import { Hono } from 'hono'
  import { handle } from 'hono/vercel'
  import chat from './routes/chat'
  import conversations from './routes/conversations'

  const app = new Hono().basePath('/api')

  app.route('/chat', chat)
  app.route('/conversations', conversations)

  export const GET = handle(app)
  export const POST = handle(app)
  export const DELETE = handle(app)
  export const PATCH = handle(app)
  ```

**Next.js API Route統合:**
- [x] `src/app/api/[...route]/route.ts` の作成
  ```typescript
  export { GET, POST, DELETE, PATCH } from '@/server/api'
  ```

**テスト実行:**
- [ ] 全ての統合テストが通ることを確認（後で実装）

---

## Phase 3: フロントエンド実装

### 3.1 グローバル設定

**テーマプロバイダーの設定:**
- [ ] `src/components/providers/ThemeProvider.tsx` の実装
  ```typescript
  'use client'
  import { ThemeProvider as NextThemesProvider } from 'next-themes'

  export function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </NextThemesProvider>
    )
  }
  ```

**ルートレイアウトの設定:**
- [ ] `src/app/layout.tsx` の実装
  - ThemeProvider の組み込み
  - グローバルスタイルの適用
  - フォント設定

**グローバルスタイル:**
- [ ] `src/app/globals.css` の調整
  - Tailwind directives
  - ダークモード用カスタムCSS変数
  - スクロールバースタイル

### 3.2 APIクライアントの作成

- [ ] `src/lib/api/client.ts` の実装
  ```typescript
  export class APIClient {
    async sendMessage(conversationId: string | undefined, message: string): Promise<ReadableStream>
    async getConversations(): Promise<Conversation[]>
    async getConversation(id: string): Promise<Conversation>
    async createConversation(): Promise<Conversation>
    async deleteConversation(id: string): Promise<void>
  }

  export const apiClient = new APIClient()
  ```

### 3.3 UIコンポーネントの実装

**共通UIコンポーネント:**
- [ ] ダークモードトグル: `src/components/ui/ThemeToggle.tsx`
- [ ] ローディングスピナー: `src/components/ui/LoadingSpinner.tsx`
- [ ] エラー表示: `src/components/ui/ErrorMessage.tsx`

**チャット用コンポーネント（TDD推奨）:**

- [ ] `src/components/chat/ChatMessage.tsx`
  - ユーザーメッセージ/AIメッセージの表示
  - Markdownレンダリング
  - コードブロックのシンタックスハイライト
  - コピーボタン
  - テスト: `tests/unit/components/ChatMessage.test.tsx`

- [ ] `src/components/chat/ChatInput.tsx`
  - テキストエリア
  - 送信ボタン
  - ローディング状態
  - Enter キーでの送信（Shift+Enterで改行）
  - テスト: `tests/unit/components/ChatInput.test.tsx`

- [ ] `src/components/chat/ChatSidebar.tsx`
  - 会話履歴一覧
  - 新規会話ボタン
  - 会話削除ボタン
  - モバイル対応（ハンバーガーメニュー）
  - テスト: `tests/unit/components/ChatSidebar.test.tsx`

- [ ] `src/components/chat/ChatContainer.tsx`
  - メッセージリストの表示
  - 自動スクロール
  - ストリーミングメッセージの表示
  - テスト: `tests/unit/components/ChatContainer.test.tsx`

### 3.4 カスタムフックの実装

- [ ] `src/hooks/useChat.ts`
  ```typescript
  export function useChat(conversationId?: string) {
    // メッセージ送信
    // ストリーミング処理
    // エラーハンドリング
    return {
      messages,
      isLoading,
      error,
      sendMessage,
    }
  }
  ```
  - テスト: `tests/unit/hooks/useChat.test.ts`

- [ ] `src/hooks/useConversations.ts`
  ```typescript
  export function useConversations() {
    // 会話一覧の取得
    // 会話の作成・削除
    return {
      conversations,
      isLoading,
      createConversation,
      deleteConversation,
    }
  }
  ```
  - テスト: `tests/unit/hooks/useConversations.test.ts`

### 3.5 ページの実装

**ホームページ:**
- [ ] `src/app/page.tsx` の実装
  - 新規会話の開始
  - または会話一覧へリダイレクト

**チャットページ:**
- [ ] `src/app/chat/[id]/page.tsx` の実装
  - ChatContainer
  - ChatInput
  - ChatSidebar
  - レイアウト調整（2カラム）
  - レスポンシブ対応

**エラーページ:**
- [ ] `src/app/error.tsx` の実装
- [ ] `src/app/not-found.tsx` の実装

---

## Phase 4: テスト実装・品質保証

### 4.1 ユニットテストの完成

- [ ] 全てのサービスクラスのテストカバレッジ80%以上を確認
- [ ] 全てのカスタムフックのテスト実装
- [ ] 全てのコンポーネントのテスト実装
- [ ] エッジケースのテスト追加

### 4.2 統合テストの完成

- [ ] 全てのAPIエンドポイントのテスト実装
- [ ] エラーハンドリングのテスト
- [ ] バリデーションのテスト
- [ ] データベース操作のテスト

### 4.3 E2Eテストの実装

- [ ] `tests/e2e/chat-flow.spec.ts`
  - 新規会話の作成
  - メッセージの送信
  - AI応答の受信
  - 会話履歴の保存

- [ ] `tests/e2e/conversation-management.spec.ts`
  - 会話一覧の表示
  - 会話の切り替え
  - 会話の削除

- [ ] `tests/e2e/ui-interactions.spec.ts`
  - ダークモード切り替え
  - レスポンシブ表示
  - エラー表示

### 4.4 パフォーマンステスト

- [ ] Lighthouse スコアの確認（目標: 90+）
- [ ] バンドルサイズの最適化
- [ ] 画像最適化の確認
- [ ] レンダリングパフォーマンスの測定

### 4.5 アクセシビリティテスト

- [ ] キーボードナビゲーション確認
- [ ] スクリーンリーダー対応確認
- [ ] ARIA属性の適切な使用
- [ ] コントラスト比の確認

---

## Phase 5: デプロイ準備

### 5.1 Docker化

- [ ] `docker/Dockerfile` の作成
  ```dockerfile
  FROM node:20-alpine AS base

  # Dependencies
  FROM base AS deps
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci

  # Builder
  FROM base AS builder
  WORKDIR /app
  COPY --from=deps /app/node_modules ./node_modules
  COPY . .
  RUN npx prisma generate
  RUN npm run build

  # Runner
  FROM base AS runner
  WORKDIR /app
  ENV NODE_ENV production
  COPY --from=builder /app/public ./public
  COPY --from=builder /app/.next/standalone ./
  COPY --from=builder /app/.next/static ./.next/static

  EXPOSE 3000
  CMD ["node", "server.js"]
  ```

- [ ] `.dockerignore` の作成
- [ ] ローカルでのDockerビルド確認
  ```bash
  docker build -f docker/Dockerfile -t ai-chat .
  docker run -p 3000:3000 ai-chat
  ```

### 5.2 Google Cloud Run 設定

- [ ] Google Cloud SDK のインストール
- [ ] GCP プロジェクトの作成
- [ ] Cloud Run API の有効化
- [ ] Secret Manager の設定
  ```bash
  gcloud secrets create ANTHROPIC_API_KEY --data-file=-
  gcloud secrets create DATABASE_URL --data-file=-
  ```

- [ ] `cloudbuild.yaml` の作成
  ```yaml
  steps:
    - name: 'gcr.io/cloud-builders/docker'
      args: ['build', '-t', 'gcr.io/$PROJECT_ID/ai-chat', '-f', 'docker/Dockerfile', '.']

    - name: 'gcr.io/cloud-builders/docker'
      args: ['push', 'gcr.io/$PROJECT_ID/ai-chat']

    - name: 'gcr.io/cloud-builders/gcloud'
      args:
        - 'run'
        - 'deploy'
        - 'ai-chat'
        - '--image=gcr.io/$PROJECT_ID/ai-chat'
        - '--platform=managed'
        - '--region=asia-northeast1'
        - '--allow-unauthenticated'
        - '--set-secrets=ANTHROPIC_API_KEY=ANTHROPIC_API_KEY:latest,DATABASE_URL=DATABASE_URL:latest'
  ```

### 5.3 CI/CD パイプラインの構築

- [ ] `.github/workflows/ci.yml` の作成
  ```yaml
  name: CI

  on:
    push:
      branches: [main, develop]
    pull_request:
      branches: [main, develop]

  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: '20'
        - run: npm ci
        - run: npm run lint
        - run: npm run test
        - run: npm run test:e2e

    build:
      runs-on: ubuntu-latest
      needs: test
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
        - run: npm ci
        - run: npm run build
  ```

- [ ] `.github/workflows/deploy.yml` の作成（本番デプロイ用）

### 5.4 環境変数の設定

- [ ] 本番環境用 `.env.production` の準備
- [ ] GCP Secret Manager に環境変数を登録
- [ ] MongoDB Atlas への接続設定

### 5.5 モニタリング・ロギング設定

- [ ] Google Cloud Logging の設定
- [ ] エラートラッキング（Sentry など）の導入検討
- [ ] アナリティクスの導入検討

### 5.6 セキュリティチェック

- [ ] 依存関係の脆弱性チェック
  ```bash
  npm audit
  ```
- [ ] HTTPS の強制確認
- [ ] CORS 設定の確認
- [ ] レート制限の実装確認
- [ ] 環境変数の漏洩チェック

### 5.7 ドキュメント整備

- [ ] `README.md` の更新
  - プロジェクト概要
  - セットアップ手順
  - 開発方法
  - デプロイ方法
- [ ] API ドキュメントの作成（オプション）
- [ ] コントリビューションガイドの作成（オプション）

### 5.8 本番デプロイ

- [ ] ステージング環境でのテスト
- [ ] 本番環境への初回デプロイ
- [ ] デプロイ後の動作確認
- [ ] パフォーマンスモニタリング
- [ ] エラーログの監視

---

## 🎯 マイルストーン

### マイルストーン 1: 開発環境構築完了
- 期日: 実装開始から1日以内
- 成果物: プロジェクト初期化、依存関係インストール、開発環境起動

### マイルストーン 2: バックエンドAPI完成
- 期日: 実装開始から3-5日以内
- 成果物: 全APIエンドポイント実装、テスト通過、ドキュメント

### マイルストーン 3: フロントエンド完成
- 期日: 実装開始から7-10日以内
- 成果物: 全画面実装、レスポンシブ対応、ダークモード対応

### マイルストーン 4: テスト・品質保証完了
- 期日: 実装開始から10-12日以内
- 成果物: カバレッジ80%以上、E2Eテスト全通過

### マイルストーン 5: 本番デプロイ完了
- 期日: 実装開始から14日以内
- 成果物: Cloud Run稼働、モニタリング設定完了

---

## 📊 進捗管理

### タスクステータス
- `[ ]` 未着手
- `[~]` 進行中
- `[x]` 完了
- `[!]` ブロック中

### 優先度
- 🔴 高優先度（必須）
- 🟡 中優先度（推奨）
- 🟢 低優先度（オプション）

---

## 🚨 リスク管理

### 技術的リスク

1. **Mastra フレームワークの学習曲線**
   - 対策: 公式ドキュメントの事前確認、サンプルコードの作成

2. **ストリーミングAPIの実装難易度**
   - 対策: シンプルな実装から開始、段階的に改善

3. **MongoDB との Prisma 連携**
   - 対策: 事前に小規模なプロトタイプで検証

### スケジュールリスク

1. **想定より時間がかかる可能性**
   - 対策: 各フェーズに余裕を持たせる、MVP機能に集中

2. **外部API（Claude）の不安定性**
   - 対策: エラーハンドリングの徹底、リトライ機構の実装

---

## 📚 参考リソース

- [Next.js Documentation](https://nextjs.org/docs)
- [Hono Documentation](https://hono.dev/)
- [Prisma MongoDB Guide](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
- [Mastra Documentation](https://docs.mastra.ai/)
- [Anthropic API Reference](https://docs.anthropic.com/)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)

---

**次のアクション**: Phase 0 の実装を開始してください。

