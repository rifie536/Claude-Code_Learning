import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { errorHandler } from '@/server/middleware/errorHandler'
import { corsMiddleware } from '@/server/middleware/cors'
import chat from './routes/chat'
import conversations from './routes/conversations'

const app = new Hono().basePath('/api')

// ミドルウェア
app.use('*', corsMiddleware)
app.use('*', errorHandler)

// ヘルスチェック
app.get('/health', c => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ルート
app.route('/chat', chat)
app.route('/conversations', conversations)

// Next.js API Route用のエクスポート
export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
export const PATCH = handle(app)

export default app
