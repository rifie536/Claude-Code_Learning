import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AIService } from '@/server/services/aiService'
import type { Message } from '@/types'

// chatAgentのモックを作成
vi.mock('@/lib/mastra/config', () => ({
  chatAgent: {
    stream: vi.fn(),
    generate: vi.fn(),
  },
}))

import { chatAgent } from '@/lib/mastra/config'

describe('AIService', () => {
  let aiService: AIService

  beforeEach(() => {
    aiService = new AIService()
    vi.clearAllMocks()
  })

  describe('generateStreamingResponse', () => {
    it('should stream response chunks successfully', async () => {
      const chunks: string[] = []
      const mockStream = {
        textStream: (async function* () {
          yield 'Hello'
          yield ' '
          yield 'World'
        })(),
      }

      vi.mocked(chatAgent.stream).mockResolvedValue(mockStream as any)

      const conversationHistory = [
        { role: 'user', content: 'こんにちは' },
      ]

      await aiService.generateStreamingResponse(
        conversationHistory,
        (chunk) => chunks.push(chunk)
      )

      expect(chatAgent.stream).toHaveBeenCalledWith(['こんにちは'])
      expect(chunks).toEqual(['Hello', ' ', 'World'])
    })

    it('should call onComplete callback when streaming finishes', async () => {
      const mockStream = {
        textStream: (async function* () {
          yield 'Test'
        })(),
      }

      vi.mocked(chatAgent.stream).mockResolvedValue(mockStream as any)

      const onComplete = vi.fn()
      const conversationHistory = [
        { role: 'user', content: 'Test' },
      ]

      await aiService.generateStreamingResponse(
        conversationHistory,
        () => {},
        onComplete
      )

      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('should handle errors during streaming', async () => {
      const error = new Error('Stream error')
      vi.mocked(chatAgent.stream).mockRejectedValue(error)

      const conversationHistory = [
        { role: 'user', content: 'Test' },
      ]

      await expect(
        aiService.generateStreamingResponse(conversationHistory, () => {})
      ).rejects.toThrow('Stream error')
    })

    it('should handle multiple messages in conversation history', async () => {
      const mockStream = {
        textStream: (async function* () {
          yield 'Response'
        })(),
      }

      vi.mocked(chatAgent.stream).mockResolvedValue(mockStream as any)

      const conversationHistory = [
        { role: 'user', content: 'First message' },
        { role: 'assistant', content: 'First response' },
        { role: 'user', content: 'Second message' },
      ]

      await aiService.generateStreamingResponse(
        conversationHistory,
        () => {}
      )

      expect(chatAgent.stream).toHaveBeenCalledWith([
        'First message',
        'First response',
        'Second message',
      ])
    })

    it('should stream empty chunks without error', async () => {
      const chunks: string[] = []
      const mockStream = {
        textStream: (async function* () {
          yield ''
          yield 'Text'
          yield ''
        })(),
      }

      vi.mocked(chatAgent.stream).mockResolvedValue(mockStream as any)

      await aiService.generateStreamingResponse(
        [{ role: 'user', content: 'Test' }],
        (chunk) => chunks.push(chunk)
      )

      expect(chunks).toEqual(['', 'Text', ''])
    })
  })

  describe('generateResponse', () => {
    it('should generate non-streaming response successfully', async () => {
      vi.mocked(chatAgent.generate).mockResolvedValue({
        text: 'Generated response',
      } as any)

      const conversationHistory = [
        { role: 'user', content: 'Test question' },
      ]

      const response = await aiService.generateResponse(conversationHistory)

      expect(chatAgent.generate).toHaveBeenCalledWith(['Test question'])
      expect(response).toBe('Generated response')
    })

    it('should return empty string when text is undefined', async () => {
      vi.mocked(chatAgent.generate).mockResolvedValue({
        text: undefined,
      } as any)

      const response = await aiService.generateResponse([
        { role: 'user', content: 'Test' },
      ])

      expect(response).toBe('')
    })

    it('should handle errors during generation', async () => {
      const error = new Error('Generation error')
      vi.mocked(chatAgent.generate).mockRejectedValue(error)

      await expect(
        aiService.generateResponse([{ role: 'user', content: 'Test' }])
      ).rejects.toThrow('Generation error')
    })

    it('should handle multiple messages in conversation history', async () => {
      vi.mocked(chatAgent.generate).mockResolvedValue({
        text: 'Multi-turn response',
      } as any)

      const conversationHistory = [
        { role: 'user', content: 'Question 1' },
        { role: 'assistant', content: 'Answer 1' },
        { role: 'user', content: 'Question 2' },
      ]

      const response = await aiService.generateResponse(conversationHistory)

      expect(chatAgent.generate).toHaveBeenCalledWith([
        'Question 1',
        'Answer 1',
        'Question 2',
      ])
      expect(response).toBe('Multi-turn response')
    })

    it('should return empty string for null text', async () => {
      vi.mocked(chatAgent.generate).mockResolvedValue({
        text: null,
      } as any)

      const response = await aiService.generateResponse([
        { role: 'user', content: 'Test' },
      ])

      expect(response).toBe('')
    })
  })

  describe('formatConversationHistory', () => {
    it('should format messages correctly', () => {
      const messages: Message[] = [
        {
          id: '1',
          conversationId: 'conv1',
          role: 'user',
          content: 'Hello',
          createdAt: new Date(),
        },
        {
          id: '2',
          conversationId: 'conv1',
          role: 'assistant',
          content: 'Hi there',
          createdAt: new Date(),
        },
      ]

      const formatted = aiService.formatConversationHistory(messages)

      expect(formatted).toEqual([
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' },
      ])
    })

    it('should handle empty message array', () => {
      const formatted = aiService.formatConversationHistory([])
      expect(formatted).toEqual([])
    })

    it('should preserve message order', () => {
      const messages: Message[] = [
        {
          id: '1',
          conversationId: 'conv1',
          role: 'user',
          content: 'First',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: '2',
          conversationId: 'conv1',
          role: 'assistant',
          content: 'Second',
          createdAt: new Date('2024-01-02'),
        },
        {
          id: '3',
          conversationId: 'conv1',
          role: 'user',
          content: 'Third',
          createdAt: new Date('2024-01-03'),
        },
      ]

      const formatted = aiService.formatConversationHistory(messages)

      expect(formatted[0].content).toBe('First')
      expect(formatted[1].content).toBe('Second')
      expect(formatted[2].content).toBe('Third')
    })

    it('should handle system messages', () => {
      const messages: Message[] = [
        {
          id: '1',
          conversationId: 'conv1',
          role: 'system',
          content: 'System prompt',
          createdAt: new Date(),
        },
        {
          id: '2',
          conversationId: 'conv1',
          role: 'user',
          content: 'User message',
          createdAt: new Date(),
        },
      ]

      const formatted = aiService.formatConversationHistory(messages)

      expect(formatted).toEqual([
        { role: 'system', content: 'System prompt' },
        { role: 'user', content: 'User message' },
      ])
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long conversation history', async () => {
      const longHistory = Array.from({ length: 100 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
      }))

      const mockStream = {
        textStream: (async function* () {
          yield 'Response'
        })(),
      }

      vi.mocked(chatAgent.stream).mockResolvedValue(mockStream as any)

      await expect(
        aiService.generateStreamingResponse(longHistory, () => {})
      ).resolves.not.toThrow()
    })

    it('should handle special characters in content', async () => {
      const mockStream = {
        textStream: (async function* () {
          yield 'Response'
        })(),
      }

      vi.mocked(chatAgent.stream).mockResolvedValue(mockStream as any)

      const specialChars = [
        { role: 'user', content: '日本語のテスト' },
        { role: 'user', content: 'Emoji test 🎉🚀' },
        { role: 'user', content: 'Special chars: <>&"\'\\n\\t' },
      ]

      await expect(
        aiService.generateStreamingResponse(specialChars, () => {})
      ).resolves.not.toThrow()
    })
  })
})
