# AIチャットボット プロジェクト仕様書

## プロジェクト概要

Anthropic Claude APIを使用した一般的な会話アシスタントチャットボットを構築します。
Next.js App Router、Hono、Prisma.js、Mastraフレームワークを活用し、モダンで拡張性の高いアーキテクチャを実現します。

## 技術スタック

### フロントエンド
- **フレームワーク**: Next.js 14+ (App Router)
- **言語**: TypeScript (strict mode)
- **スタイリング**: Tailwind CSS
- **UI コンポーネント**: shadcn/ui または Radix UI推奨
- **状態管理**: React Context API または Zustand
- **HTTPクライアント**: fetch API

### バックエンド
- **APIフレームワーク**: Hono
- **ORM**: Prisma.js
- **データベース**: MongoDB
- **AIフレームワーク**: Mastra
- **AI プロバイダー**: Anthropic Claude API

### インフラ・デプロイ
- **ホスティング**: Google Cloud Platform (Cloud Run)
- **コンテナ**: Docker
- **CI/CD**: GitHub Actions推奨
- **環境変数管理**: .env.local (開発)、GCP Secret Manager (本番)

### 開発ツール
- **パッケージマネージャー**: npm または pnpm
- **リンター**: ESLint
- **フォーマッター**: Prettier
- **テストフレームワーク**:
  - ユニットテスト: Vitest または Jest
  - E2Eテスト: Playwright
  - APIテスト: Supertest
- **型チェック**: TypeScript (strict mode)

## 主要機能

### 1. チャット機能
- リアルタイムAI会話インターフェース
- ストリーミング応答対応（Server-Sent Events または WebSocket）
- メッセージの送信・受信
- 入力中の状態表示
- エラーハンドリング

### 2. 会話履歴管理
- 会話セッションの保存（MongoDB）
- 過去の会話の一覧表示
- 会話の再開機能
- 会話の削除機能
- 会話のタイトル自動生成

### 3. UI/UX機能
- **ダークモード対応**
  - システム設定の自動検知
  - 手動切り替え機能
  - 設定の永続化（localStorage）

- **レスポンシブデザイン**
  - モバイル（320px〜）
  - タブレット（768px〜）
  - デスクトップ（1024px〜）

- **メッセージ表示**
  - Markdown形式のレンダリング（react-markdown推奨）
  - コードブロックのシンタックスハイライト（highlight.js または Prism.js）
  - コードコピー機能
  - 改行・段落の適切な処理

## アーキテクチャ設計

### ディレクトリ構造

```
ai-chat/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # ルートレイアウト
│   │   ├── page.tsx           # ホームページ
│   │   ├── chat/              # チャット画面
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── api/               # API Routes (Hono統合)
│   │       └── [...route]/
│   │           └── route.ts
│   ├── components/            # Reactコンポーネント
│   │   ├── chat/
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   └── ChatSidebar.tsx
│   │   ├── ui/               # 共通UIコンポーネント
│   │   └── providers/        # Context Providers
│   ├── lib/                  # ユーティリティ・ヘルパー
│   │   ├── api/             # API クライアント
│   │   ├── mastra/          # Mastra設定
│   │   ├── prisma.ts        # Prisma クライアント
│   │   └── utils.ts
│   ├── server/              # バックエンドロジック
│   │   ├── api/            # Hono APIハンドラー
│   │   │   ├── routes/
│   │   │   │   ├── chat.ts
│   │   │   │   └── conversations.ts
│   │   │   └── index.ts
│   │   ├── services/       # ビジネスロジック
│   │   │   ├── aiService.ts
│   │   │   └── conversationService.ts
│   │   └── middleware/     # カスタムミドルウェア
│   ├── types/              # TypeScript型定義
│   └── styles/             # グローバルスタイル
├── prisma/
│   ├── schema.prisma       # Prismaスキーマ
│   └── seed.ts            # シードデータ
├── tests/                 # テストファイル
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/                # 静的ファイル
├── .env.example          # 環境変数テンプレート
├── .env.local            # ローカル環境変数（git管理外）
├── docker/
│   └── Dockerfile
├── .github/
│   └── workflows/
│       └── ci.yml
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── CLAUDE.md             # このファイル
```

### データモデル（Prisma Schema）

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
  role           String       // "user" | "assistant" | "system"
  content        String
  createdAt      DateTime     @default(now())

  @@index([conversationId])
}
```

### API エンドポイント設計

#### Hono APIルート

```
POST   /api/chat              # 新しいメッセージを送信（ストリーミング対応）
GET    /api/conversations     # 会話一覧を取得
POST   /api/conversations     # 新しい会話を作成
GET    /api/conversations/:id # 特定の会話を取得
DELETE /api/conversations/:id # 会話を削除
PATCH  /api/conversations/:id # 会話を更新（タイトルなど）
```

#### リクエスト/レスポンス例

**POST /api/chat**
```typescript
// Request
{
  "conversationId": "optional-conversation-id",
  "message": "こんにちは"
}

// Response (Streaming)
data: {"type":"start"}
data: {"type":"text","content":"こんにちは"}
data: {"type":"text","content":"！"}
data: {"type":"end","messageId":"msg-id"}
```

## Mastra フレームワーク統合

### Mastra 設定

```typescript
// src/lib/mastra/config.ts
import { Mastra } from '@mastra/core';
import { Anthropic } from '@mastra/anthropic';

export const mastra = new Mastra({
  providers: {
    anthropic: new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
      model: 'claude-3-5-sonnet-20241022',
    }),
  },
});
```

### AI サービス実装

```typescript
// src/server/services/aiService.ts
import { mastra } from '@/lib/mastra/config';

export class AIService {
  async generateResponse(
    conversationHistory: Array<{ role: string; content: string }>,
    onChunk?: (text: string) => void
  ) {
    const response = await mastra.anthropic.chat({
      messages: conversationHistory,
      stream: true,
    });

    for await (const chunk of response) {
      if (chunk.type === 'text' && onChunk) {
        onChunk(chunk.content);
      }
    }
  }
}
```

## テスト戦略（TDD）

### テスト方針
プロジェクトではテスト駆動開発（TDD）を採用し、以下の順序で開発を進めます：

1. **Red**: テストを先に書き、失敗することを確認
2. **Green**: テストをパスする最小限のコードを実装
3. **Refactor**: コードをリファクタリング

### テストカバレッジ目標
- ユニットテスト: 80%以上
- 統合テスト: 主要なAPIエンドポイント全て
- E2Eテスト: クリティカルなユーザーフロー全て

### テスト実装例

#### ユニットテスト
```typescript
// tests/unit/services/aiService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { AIService } from '@/server/services/aiService';

describe('AIService', () => {
  it('should generate AI response with streaming', async () => {
    const aiService = new AIService();
    const chunks: string[] = [];

    await aiService.generateResponse(
      [{ role: 'user', content: 'こんにちは' }],
      (chunk) => chunks.push(chunk)
    );

    expect(chunks.length).toBeGreaterThan(0);
  });
});
```

#### 統合テスト
```typescript
// tests/integration/api/chat.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '@/server/api';

describe('POST /api/chat', () => {
  it('should return streaming response', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({
        message: 'テストメッセージ',
      })
      .expect(200);

    expect(response.headers['content-type']).toContain('text/event-stream');
  });
});
```

#### E2Eテスト
```typescript
// tests/e2e/chat.spec.ts
import { test, expect } from '@playwright/test';

test('ユーザーがメッセージを送信できる', async ({ page }) => {
  await page.goto('/');

  await page.fill('[data-testid="chat-input"]', 'こんにちは');
  await page.click('[data-testid="send-button"]');

  await expect(page.locator('[data-testid="user-message"]')).toContainText('こんにちは');
  await expect(page.locator('[data-testid="assistant-message"]')).toBeVisible();
});
```

## 環境変数

### 必須環境変数

```bash
# .env.example
# Database
DATABASE_URL="mongodb://localhost:27017/ai-chat"

# Anthropic API
ANTHROPIC_API_KEY="sk-ant-xxx"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Node Environment
NODE_ENV="development"
```

### Google Cloud Run デプロイ設定

```yaml
# cloudbuild.yaml (CI/CD用)
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/ai-chat', '.']

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
```

## コーディング規約

### TypeScript
- strict モードを有効にする
- any 型の使用を避ける
- 明示的な型定義を優先
- インターフェースよりも type を優先（必要に応じて使い分け）

### React コンポーネント
- 関数コンポーネントを使用
- カスタムフックで状態ロジックを分離
- Props は明示的に型定義
- データ属性（data-testid）をテスト用に追加

### CSS / Tailwind
- Tailwind CSS のユーティリティクラスを優先
- カスタムコンポーネントは shadcn/ui パターンに従う
- ダークモード対応は `dark:` プレフィックスを使用

### Gitコミット
- Conventional Commits 形式を厳守
  - `feat:` 新機能
  - `fix:` バグ修正
  - `docs:` ドキュメント
  - `style:` フォーマット
  - `refactor:` リファクタリング
  - `test:` テスト追加・修正
  - `chore:` その他の変更

例：
```
feat: チャットストリーミング機能を実装
fix: 会話履歴が正しく読み込まれない問題を修正
test: AIサービスのユニットテストを追加
```

## セキュリティ考慮事項

### API セキュリティ
- レート制限の実装（Honoミドルウェア）
- 入力値のバリデーション（Zod推奨）
- CORS設定の適切な管理
- API キーの安全な管理（環境変数、Secret Manager）

### データセキュリティ
- ユーザー入力のサニタイゼーション
- XSS対策（Reactのデフォルト動作を活用）
- MongoDB インジェクション対策（Prisma使用で対策）

### インフラセキュリティ
- HTTPS強制
- 環境変数の暗号化（GCP Secret Manager）
- 最小権限の原則に従ったIAM設定

## パフォーマンス最適化

### フロントエンド
- Next.js の動的インポート活用
- 画像最適化（next/image）
- コード分割
- メモ化（React.memo, useMemo, useCallback）

### バックエンド
- データベースインデックスの適切な設定
- ストリーミングレスポンスによるTTFB改善
- キャッシング戦略（必要に応じてRedis導入検討）

### MongoDB最適化
- クエリの最適化
- 適切なインデックス設定
- コネクションプーリング

## 開発フロー

### 初期セットアップ
```bash
# 依存関係のインストール
npm install

# Prisma セットアップ
npx prisma generate
npx prisma db push

# 開発サーバー起動
npm run dev
```

### 開発サイクル
1. feature ブランチを作成
2. テストを先に書く（TDD）
3. 実装コードを書く
4. テストが通ることを確認
5. リファクタリング
6. Conventional Commits でコミット
7. プルリクエスト作成
8. レビュー・マージ

### テスト実行
```bash
# ユニットテスト
npm run test

# E2Eテスト
npm run test:e2e

# カバレッジ
npm run test:coverage
```

## 今後の拡張予定

### Phase 2（将来的な機能）
- ユーザー認証機能（NextAuth.js）
- ファイルアップロード機能（画像・ドキュメント解析）
- 会話のエクスポート機能（JSON, Markdown）
- プロンプトテンプレート機能
- マルチモーダル対応（画像生成、音声）
- 複数のAIモデル選択機能

### Phase 3（高度な機能）
- RAG（Retrieval-Augmented Generation）実装
- カスタムナレッジベース
- チーム共有機能
- API使用量ダッシュボード

## リファレンス

### 公式ドキュメント
- [Next.js Documentation](https://nextjs.org/docs)
- [Hono Documentation](https://hono.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Mastra Documentation](https://docs.mastra.ai/)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Google Cloud Run](https://cloud.google.com/run/docs)

### 関連ツール
- [shadcn/ui](https://ui.shadcn.com/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [Zod](https://zod.dev/)

---

**更新日**: 2025-12-10
**バージョン**: 1.0.0
