import { Hono } from 'hono'
import { conversationService } from '@/server/services/conversationService'
import { z } from 'zod'

const conversations = new Hono()

// バリデーションスキーマ
const createConversationSchema = z.object({
  title: z.string().optional(),
})

const updateConversationSchema = z.object({
  title: z.string().min(1),
})

// GET /api/conversations - 会話一覧取得
conversations.get('/', async c => {
  try {
    const conversationsList = await conversationService.listConversations()
    return c.json(conversationsList)
  } catch (error) {
    console.error('Error listing conversations:', error)
    return c.json({ error: 'Failed to fetch conversations' }, 500)
  }
})

// POST /api/conversations - 新規会話作成
conversations.post('/', async c => {
  try {
    const body = await c.req.json()
    const { title } = createConversationSchema.parse(body)

    const conversation = await conversationService.createConversation(title)
    return c.json(conversation, 201)
  } catch (error) {
    console.error('Error creating conversation:', error)
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request body', details: error.errors }, 400)
    }
    return c.json({ error: 'Failed to create conversation' }, 500)
  }
})

// GET /api/conversations/:id - 会話詳細取得
conversations.get('/:id', async c => {
  try {
    const id = c.req.param('id')
    const conversation = await conversationService.getConversation(id)

    if (!conversation) {
      return c.json({ error: 'Conversation not found' }, 404)
    }

    return c.json(conversation)
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return c.json({ error: 'Failed to fetch conversation' }, 500)
  }
})

// PATCH /api/conversations/:id - 会話タイトル更新
conversations.patch('/:id', async c => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { title } = updateConversationSchema.parse(body)

    const conversation = await conversationService.updateConversationTitle(id, title)
    return c.json(conversation)
  } catch (error) {
    console.error('Error updating conversation:', error)
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request body', details: error.errors }, 400)
    }
    return c.json({ error: 'Failed to update conversation' }, 500)
  }
})

// DELETE /api/conversations/:id - 会話削除
conversations.delete('/:id', async c => {
  try {
    const id = c.req.param('id')
    await conversationService.deleteConversation(id)
    return c.json({ success: true })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return c.json({ error: 'Failed to delete conversation' }, 500)
  }
})

export default conversations
