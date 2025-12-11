import { describe, it, expect, vi, beforeEach } from 'vitest'
import app from '@/server/api'

// 依存関係をモック
vi.mock('@/server/services/conversationService')
vi.mock('@/server/services/aiService')

describe('API Integration Tests', () => {
  describe('GET /api/health', () => {
    it('returns health status', async () => {
      const res = await app.request('/api/health')
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toHaveProperty('status', 'ok')
      expect(data).toHaveProperty('timestamp')
    })
  })

  describe('GET /api/conversations', () => {
    it('returns conversations list', async () => {
      const { ConversationService } = await import('@/server/services/conversationService')
      const mockListConversations = vi.fn().mockResolvedValue([])

      vi.mocked(ConversationService).mockImplementation(
        () =>
          ({
            listConversations: mockListConversations,
          }) as any
      )

      const res = await app.request('/api/conversations')

      expect(res.status).toBe(200)
    })
  })

  describe('POST /api/conversations', () => {
    it('creates a new conversation', async () => {
      const { ConversationService } = await import('@/server/services/conversationService')
      const mockConversation = {
        id: '1',
        title: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      }

      const mockCreateConversation = vi.fn().mockResolvedValue(mockConversation)

      vi.mocked(ConversationService).mockImplementation(
        () =>
          ({
            createConversation: mockCreateConversation,
          }) as any
      )

      const res = await app.request('/api/conversations', {
        method: 'POST',
      })

      expect(res.status).toBe(201)
    })
  })

  describe('DELETE /api/conversations/:id', () => {
    it('deletes a conversation', async () => {
      const { ConversationService } = await import('@/server/services/conversationService')
      const mockDeleteConversation = vi.fn().mockResolvedValue(undefined)

      vi.mocked(ConversationService).mockImplementation(
        () =>
          ({
            deleteConversation: mockDeleteConversation,
          }) as any
      )

      const res = await app.request('/api/conversations/1', {
        method: 'DELETE',
      })

      expect(res.status).toBe(200)
    })
  })
})
