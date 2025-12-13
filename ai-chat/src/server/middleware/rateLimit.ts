import type { Context, Next } from 'hono'

/**
 * レート制限のための簡易的なメモリストア
 */
interface RateLimitStore {
  requests: number[]
  lastCleanup: number
}

const store = new Map<string, RateLimitStore>()

/**
 * レート制限ミドルウェアのオプション
 */
interface RateLimitOptions {
  /** 時間窓（ミリ秒） */
  windowMs: number
  /** 時間窓内の最大リクエスト数 */
  limit: number
  /** レート制限メッセージ */
  message?: string
}

/**
 * IPアドレスを取得
 */
function getClientIp(c: Context): string {
  // X-Forwarded-Forヘッダー（プロキシ経由の場合）
  const forwardedFor = c.req.header('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  // X-Real-IPヘッダー
  const realIp = c.req.header('x-real-ip')
  if (realIp) {
    return realIp
  }

  // フォールバック
  return 'unknown'
}

/**
 * レート制限ミドルウェアのファクトリー関数
 */
export function rateLimiter(options: RateLimitOptions) {
  const { windowMs, limit, message = 'Too many requests, please try again later.' } = options

  return async (c: Context, next: Next) => {
    const clientIp = getClientIp(c)
    const now = Date.now()

    // ストアから既存データを取得または初期化
    let clientStore = store.get(clientIp)
    if (!clientStore) {
      clientStore = { requests: [], lastCleanup: now }
      store.set(clientIp, clientStore)
    }

    // 古いリクエストを削除（時間窓外のもの）
    clientStore.requests = clientStore.requests.filter((timestamp) => now - timestamp < windowMs)

    // リクエスト数チェック
    if (clientStore.requests.length >= limit) {
      const oldestRequest = clientStore.requests[0]
      const resetTime = oldestRequest + windowMs
      const retryAfter = Math.ceil((resetTime - now) / 1000)

      return c.json(
        {
          error: message,
          retryAfter,
          limit,
          remaining: 0,
        },
        429,
        {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(resetTime).toISOString(),
        }
      )
    }

    // 新しいリクエストを記録
    clientStore.requests.push(now)

    // レート制限ヘッダーを追加
    c.header('X-RateLimit-Limit', limit.toString())
    c.header('X-RateLimit-Remaining', (limit - clientStore.requests.length).toString())

    await next()
  }
}

/**
 * 一般的なAPIエンドポイント用のレート制限
 * 100リクエスト/分
 */
export const apiRateLimit = rateLimiter({
  windowMs: 60 * 1000, // 1分
  limit: 100,
  message: 'API rate limit exceeded. Please try again later.',
})

/**
 * チャットエンドポイント用のレート制限
 * 10メッセージ/分
 */
export const chatRateLimit = rateLimiter({
  windowMs: 60 * 1000, // 1分
  limit: 10,
  message: 'Chat rate limit exceeded. Please wait a moment before sending another message.',
})

/**
 * ストアのクリーンアップ（メモリリーク防止）
 * 定期的に呼び出すことを推奨
 */
export function cleanupRateLimitStore() {
  const now = Date.now()
  const maxAge = 60 * 60 * 1000 // 1時間

  for (const [key, value] of store.entries()) {
    if (now - value.lastCleanup > maxAge) {
      store.delete(key)
    }
  }
}

// 1時間ごとにストアをクリーンアップ
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 60 * 60 * 1000)
}
