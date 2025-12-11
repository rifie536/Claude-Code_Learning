import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ConversationService } from '@/server/services/conversationService'
import { prisma } from '@/lib/prisma'

// Prismaクライアントをモック
vi.mock('@/lib/prisma', () => ({
  prisma: {
    conversation: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    message: {
      create: vi.fn(),
    },
  },
}))

describe('ConversationService', () => {
  let service: ConversationService

  beforeEach(() => {
    service = new ConversationService()
    vi.clearAllMocks()
  })

  describe('createConversation', () => {
    it('creates a new conversation without title', async () => {
      const mockConversation = {
        id: '1',
        title: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      }

      vi.mocked(prisma.conversation.create).mockResolvedValue(mockConversation)

      const result = await service.createConversation()

      expect(result).toEqual(mockConversation)
      expect(prisma.conversation.create).toHaveBeenCalledWith({
        data: { title: undefined },
        include: { messages: true },
      })
    })

    it('creates a new conversation with title', async () => {
      const mockConversation = {
        id: '1',
        title: 'Test Title',
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      }

      vi.mocked(prisma.conversation.create).mockResolvedValue(mockConversation)

      const result = await service.createConversation('Test Title')

      expect(result.title).toBe('Test Title')
      expect(prisma.conversation.create).toHaveBeenCalledWith({
        data: { title: 'Test Title' },
        include: { messages: true },
      })
    })

    it('handles creation errors', async () => {
      const error = new Error('Database error')
      vi.mocked(prisma.conversation.create).mockRejectedValue(error)

      await expect(service.createConversation()).rejects.toThrow('Database error')
    })
  })

  describe('getConversation', () => {
    it('retrieves a conversation by id', async () => {
      const mockConversation = {
        id: '1',
        title: 'Test Conversation',
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      }

      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(mockConversation)

      const result = await service.getConversation('1')

      expect(result).toEqual(mockConversation)
      expect(prisma.conversation.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      })
    })

    it('returns null when conversation not found', async () => {
      vi.mocked(prisma.conversation.findUnique).mockResolvedValue(null)

      const result = await service.getConversation('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('listConversations', () => {
    it('retrieves all conversations', async () => {
      const mockConversations = [
        {
          id: '1',
          title: 'Conversation 1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          messages: [],
        },
        {
          id: '2',
          title: 'Conversation 2',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          messages: [],
        },
      ]

      vi.mocked(prisma.conversation.findMany).mockResolvedValue(mockConversations)

      const result = await service.listConversations()

      expect(result).toEqual(mockConversations)
      expect(prisma.conversation.findMany).toHaveBeenCalledWith({
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
      })
    })
  })

  describe('addMessage', () => {
    it('adds a user message to a conversation', async () => {
      const mockMessage = {
        id: 'msg-1',
        conversationId: 'conv-1',
        role: 'user',
        content: 'Hello',
        createdAt: new Date(),
      }

      vi.mocked(prisma.message.create).mockResolvedValue(mockMessage)

      const result = await service.addMessage('conv-1', 'user', 'Hello')

      expect(result).toEqual(mockMessage)
      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          conversationId: 'conv-1',
          role: 'user',
          content: 'Hello',
        },
      })
    })

    it('adds an assistant message to a conversation', async () => {
      const mockMessage = {
        id: 'msg-2',
        conversationId: 'conv-1',
        role: 'assistant',
        content: 'Hi there!',
        createdAt: new Date(),
      }

      vi.mocked(prisma.message.create).mockResolvedValue(mockMessage)

      const result = await service.addMessage('conv-1', 'assistant', 'Hi there!')

      expect(result.role).toBe('assistant')
    })

    it('handles empty content', async () => {
      const mockMessage = {
        id: 'msg-3',
        conversationId: 'conv-1',
        role: 'user',
        content: '',
        createdAt: new Date(),
      }

      vi.mocked(prisma.message.create).mockResolvedValue(mockMessage)

      const result = await service.addMessage('conv-1', 'user', '')

      expect(result.content).toBe('')
    })
  })

  describe('deleteConversation', () => {
    it('deletes a conversation', async () => {
      const mockConversation = {
        id: '1',
        title: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prisma.conversation.delete).mockResolvedValue(mockConversation)

      await service.deleteConversation('1')

      expect(prisma.conversation.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      })
    })

    it('handles deletion of non-existent conversation', async () => {
      const error = new Error('Record not found')
      vi.mocked(prisma.conversation.delete).mockRejectedValue(error)

      await expect(service.deleteConversation('nonexistent')).rejects.toThrow(
        'Record not found'
      )
    })
  })

  describe('updateConversationTitle', () => {
    it('updates conversation title', async () => {
      const mockConversation = {
        id: '1',
        title: 'New Title',
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      }

      vi.mocked(prisma.conversation.update).mockResolvedValue(mockConversation)

      const result = await service.updateConversationTitle('1', 'New Title')

      expect(result).toEqual(mockConversation)
      expect(prisma.conversation.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { title: 'New Title' },
        include: { messages: true },
      })
    })
  })
})
