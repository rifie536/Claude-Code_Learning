import { Hono } from 'hono'
import { stream } from 'hono/streaming'
import { z } from 'zod'
import { conversationService } from '@/server/services/conversationService'
import { aiService } from '@/server/services/aiService'

const chat = new Hono()

// バリデーションスキーマ
const chatRequestSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1),
})

// POST /api/chat - チャットメッセージ送信（ストリーミング対応）
chat.post('/', async c => {
  try {
    const body = await c.req.json()
    const { conversationId, message } = chatRequestSchema.parse(body)

    // 会話IDが指定されていない場合は新規作成
    let conversation
    if (conversationId) {
      conversation = await conversationService.getConversation(conversationId)
      if (!conversation) {
        return c.json({ error: 'Conversation not found' }, 404)
      }
    } else {
      conversation = await conversationService.createConversation()
    }

    // ユーザーメッセージを保存
    await conversationService.addMessage(conversation.id, 'user', message)

    // 会話履歴を取得
    const updatedConversation = await conversationService.getConversation(conversation.id)
    if (!updatedConversation) {
      return c.json({ error: 'Failed to fetch conversation' }, 500)
    }

    const conversationHistory = aiService.formatConversationHistory(
      updatedConversation.messages
    )

    // ストリーミングレスポンスを返す
    return stream(c, async stream => {
      // ストリーミング開始
      await stream.writeln(
        JSON.stringify({
          type: 'start',
          conversationId: conversation.id,
        })
      )

      let assistantMessage = ''

      try {
        // AIからストリーミング応答を取得
        await aiService.generateStreamingResponse(
          conversationHistory,
          async chunk => {
            assistantMessage += chunk
            await stream.writeln(
              JSON.stringify({
                type: 'text',
                content: chunk,
              })
            )
          },
          async () => {
            // 完了時にアシスタントのメッセージを保存
            const savedMessage = await conversationService.addMessage(
              conversation.id,
              'assistant',
              assistantMessage
            )

            await stream.writeln(
              JSON.stringify({
                type: 'end',
                messageId: savedMessage.id,
              })
            )
          }
        )
      } catch (error) {
        console.error('Streaming error:', error)
        await stream.writeln(
          JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        )
      }
    })
  } catch (error) {
    console.error('Chat API error:', error)
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request body', details: error.errors }, 400)
    }
    return c.json({ error: 'Failed to process chat request' }, 500)
  }
})

export default chat
