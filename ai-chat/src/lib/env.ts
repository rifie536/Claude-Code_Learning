import { z } from 'zod'

/**
 * 環境変数のスキーマ定義
 */
const envSchema = z.object({
  // データベース
  DATABASE_URL: z.string().min(1, 'DATABASE_URLは必須です'),

  // Anthropic API
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEYは必須です'),

  // Node環境
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Next.js
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
})

/**
 * 環境変数の型
 */
export type Env = z.infer<typeof envSchema>

/**
 * 環境変数のバリデーションと取得
 */
function validateEnv(): Env {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ 環境変数の検証に失敗しました:')
      console.error(
        error.errors
          .map(err => `  - ${err.path.join('.')}: ${err.message}`)
          .join('\n')
      )
      console.error('\n必要な環境変数を .env ファイルに設定してください。')
      console.error('詳細は .env.example を参照してください。')
      process.exit(1)
    }
    throw error
  }
}

/**
 * 型安全な環境変数
 */
export const env = validateEnv()

/**
 * 環境変数が正しく設定されているか確認
 */
export function checkEnv(): void {
  console.log('✅ 環境変数の検証が完了しました')
  console.log(`   - NODE_ENV: ${env.NODE_ENV}`)
  console.log(`   - DATABASE_URL: ${env.DATABASE_URL.substring(0, 20)}...`)
  console.log(`   - ANTHROPIC_API_KEY: ${env.ANTHROPIC_API_KEY.substring(0, 10)}...`)
}
