import { chatAgent } from '@/lib/mastra/config'
import type { Message } from '@/types'

export class AIService {
  async generateStreamingResponse(
    conversationHistory: Array<{ role: string; content: string }>,
    onChunk: (chunk: string) => void,
    onComplete?: () => void
  ): Promise<void> {
    try {
      // Mastraのstream APIに渡す形式に変換
      const messages = conversationHistory.map(msg => msg.content)
      const stream = await chatAgent.stream(messages)

      for await (const chunk of stream.textStream) {
        onChunk(chunk)
      }

      if (onComplete) {
        onComplete()
      }
    } catch (error) {
      console.error('AI Service Error:', error)
      throw error
    }
  }

  async generateResponse(
    conversationHistory: Array<{ role: string; content: string }>
  ): Promise<string> {
    try {
      // Mastraのgenerate APIに渡す形式に変換
      const messages = conversationHistory.map(msg => msg.content)
      const response = await chatAgent.generate(messages)
      return response.text || ''
    } catch (error) {
      console.error('AI Service Error:', error)
      throw error
    }
  }

  formatConversationHistory(messages: Message[]): Array<{ role: string; content: string }> {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }))
  }
}

export const aiService = new AIService()
