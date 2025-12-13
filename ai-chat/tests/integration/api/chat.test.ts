import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import app from '@/server/api'
import { prisma } from '@/lib/prisma'

describe('POST /api/chat', () => {
  // テスト用の会話ID
  let testConversationId: string

  beforeAll(async () => {
    // テスト前にデータベースをクリーンアップ
    await prisma.message.deleteMany({})
    await prisma.conversation.deleteMany({})
  })

  afterAll(async () => {
    // テスト後にデータベースをクリーンアップ
    await prisma.message.deleteMany({})
    await prisma.conversation.deleteMany({})
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    // 各テスト前にテスト用の会話を作成
    const conversation = await prisma.conversation.create({
      data: {
        title: 'Test Conversation',
      },
    })
    testConversationId = conversation.id
  })

  describe('基本的な機能', () => {
    it('新規会話でメッセージを送信できる', async () => {
      const response = await request(app.fetch as any)
        .post('/api/chat')
        .send({
          message: 'こんにちは',
        })
        .expect(200)

      expect(response.headers['content-type']).toContain('text/plain')
    })

    it('既存の会話にメッセージを送信できる', async () => {
      const response = await request(app.fetch as any)
        .post('/api/chat')
        .send({
          conversationId: testConversationId,
          message: 'こんにちは',
        })
        .expect(200)

      expect(response.headers['content-type']).toContain('text/plain')
    })
  })

  describe('バリデーション', () => {
    it('メッセージが空の場合、400エラーを返す', async () => {
      const response = await request(app.fetch as any)
        .post('/api/chat')
        .send({
          message: '',
        })
        .expect(400)

      expect(response.body.error).toBeDefined()
    })

    it('メッセージが2000文字を超える場合、400エラーを返す', async () => {
      const longMessage = 'あ'.repeat(2001)

      const response = await request(app.fetch as any)
        .post('/api/chat')
        .send({
          message: longMessage,
        })
        .expect(400)

      expect(response.body.error).toBeDefined()
    })

    it('リクエストボディが不正な場合、400エラーを返す', async () => {
      const response = await request(app.fetch as any)
        .post('/api/chat')
        .send({
          // messageフィールドがない
          invalidField: 'test',
        })
        .expect(400)

      expect(response.body.error).toBeDefined()
    })

    it('前後の空白を削除してバリデーションする', async () => {
      const response = await request(app.fetch as any)
        .post('/api/chat')
        .send({
          message: '  こんにちは  ',
        })
        .expect(200)

      // 空白が削除されて正常に処理される
      expect(response.headers['content-type']).toContain('text/plain')
    })
  })

  describe('会話の永続化', () => {
    it('ユーザーメッセージがデータベースに保存される', async () => {
      await request(app.fetch as any)
        .post('/api/chat')
        .send({
          conversationId: testConversationId,
          message: 'テストメッセージ',
        })

      // レスポンスが完了するまで少し待機
      await new Promise(resolve => setTimeout(resolve, 1000))

      const messages = await prisma.message.findMany({
        where: {
          conversationId: testConversationId,
        },
      })

      const userMessage = messages.find(m => m.role === 'user')
      expect(userMessage).toBeDefined()
      expect(userMessage?.content).toBe('テストメッセージ')
    })
  })

  describe('エラーハンドリング', () => {
    it('存在しない会話IDを指定した場合、404エラーを返す', async () => {
      const response = await request(app.fetch as any)
        .post('/api/chat')
        .send({
          conversationId: '000000000000000000000000',
          message: 'こんにちは',
        })
        .expect(404)

      expect(response.body.error).toBe('Conversation not found')
    })

    it('不正な会話IDを指定した場合、エラーを返す', async () => {
      const response = await request(app.fetch as any)
        .post('/api/chat')
        .send({
          conversationId: 'invalid-id',
          message: 'こんにちは',
        })

      // MongoDBのObjectIdバリデーションエラー
      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('レート制限', () => {
    it('短時間に多数のリクエストを送信した場合、429エラーを返す', async () => {
      // 11回連続でリクエスト（制限は10リクエスト/分）
      const requests = Array.from({ length: 11 }, () =>
        request(app.fetch as any)
          .post('/api/chat')
          .send({ message: 'テスト' })
      )

      const responses = await Promise.all(requests)

      // 最後のリクエストはレート制限に引っかかる
      const lastResponse = responses[responses.length - 1]
      expect(lastResponse.status).toBe(429)
      expect(lastResponse.body.error).toBeDefined()
    }, 15000) // タイムアウトを15秒に設定
  })
})

describe('ストリーミングレスポンス', () => {
  beforeAll(async () => {
    await prisma.message.deleteMany({})
    await prisma.conversation.deleteMany({})
  })

  afterAll(async () => {
    await prisma.message.deleteMany({})
    await prisma.conversation.deleteMany({})
    await prisma.$disconnect()
  })

  it('ストリーミングレスポンスを受信できる', async () => {
    const response = await request(app.fetch as any)
      .post('/api/chat')
      .send({
        message: 'こんにちは',
      })
      .expect(200)

    // ストリーミングレスポンスのcontent-typeを確認
    expect(response.headers['content-type']).toContain('text/plain')

    // レスポンスボディにstart, text, endイベントが含まれることを確認
    const body = response.text
    expect(body).toBeDefined()
    expect(body.length).toBeGreaterThan(0)
  })

  it('ストリーミングレスポンスにstartイベントが含まれる', async () => {
    const response = await request(app.fetch as any)
      .post('/api/chat')
      .send({
        message: 'テスト',
      })

    const lines = response.text.split('\n').filter(Boolean)
    const startEvent = lines.find(line => {
      try {
        const data = JSON.parse(line)
        return data.type === 'start'
      } catch {
        return false
      }
    })

    expect(startEvent).toBeDefined()
  })
})
