import { PrismaClient } from '@prisma/client'
import { env } from './env'

// 環境変数が正しく設定されていることを確認
if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined')
}

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
