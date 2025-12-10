export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  createdAt: Date
}

export interface Conversation {
  id: string
  title?: string | null
  createdAt: Date
  updatedAt: Date
  messages: Message[]
}

export interface ChatRequest {
  conversationId?: string
  message: string
}

export interface StreamChunk {
  type: 'start' | 'text' | 'end' | 'error'
  content?: string
  messageId?: string
  error?: string
}
