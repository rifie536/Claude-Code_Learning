import type { Conversation, ChatRequest, StreamChunk } from '@/types'

/**
 * バックエンドAPIと通信するクライアント
 */
export class APIClient {
  private baseUrl: string

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
  }

  /**
   * メッセージを送信し、ストリーミングレスポンスを取得
   * @param conversationId 会話ID（新規の場合はundefined）
   * @param message ユーザーメッセージ
   * @returns Server-Sent Eventsのストリーム
   */
  async sendMessage(
    conversationId: string | undefined,
    message: string
  ): Promise<ReadableStream<StreamChunk>> {
    const request: ChatRequest = {
      conversationId,
      message,
    }

    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    if (!response.body) {
      throw new Error('Response body is null')
    }

    // Server-Sent EventsをStreamChunk型に変換
    return this.transformSSEStream(response.body)
  }

  /**
   * 全ての会話一覧を取得
   * @returns 会話の配列
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await fetch(`${this.baseUrl}/conversations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.conversations
  }

  /**
   * 特定の会話を取得
   * @param id 会話ID
   * @returns 会話オブジェクト
   */
  async getConversation(id: string): Promise<Conversation> {
    const response = await fetch(`${this.baseUrl}/conversations/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.conversation
  }

  /**
   * 新規会話を作成
   * @returns 作成された会話オブジェクト
   */
  async createConversation(): Promise<Conversation> {
    const response = await fetch(`${this.baseUrl}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.conversation
  }

  /**
   * 会話を削除
   * @param id 会話ID
   */
  async deleteConversation(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/conversations/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }
  }

  /**
   * 会話のタイトルを更新
   * @param id 会話ID
   * @param title 新しいタイトル
   * @returns 更新された会話オブジェクト
   */
  async updateConversationTitle(id: string, title: string): Promise<Conversation> {
    const response = await fetch(`${this.baseUrl}/conversations/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.conversation
  }

  /**
   * Server-Sent EventsストリームをStreamChunk型のストリームに変換
   * @param stream 元のReadableStream
   * @returns StreamChunk型のReadableStream
   */
  private transformSSEStream(stream: ReadableStream<Uint8Array>): ReadableStream<StreamChunk> {
    const reader = stream.getReader()
    const decoder = new TextDecoder()

    return new ReadableStream<StreamChunk>({
      async start(controller) {
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              controller.close()
              break
            }

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.trim() === '') continue

              try {
                const chunk: StreamChunk = JSON.parse(line)
                controller.enqueue(chunk)
              } catch (e) {
                console.error('Failed to parse SSE chunk:', line, e)
              }
            }
          }
        } catch (error) {
          controller.error(error)
        }
      },
    })
  }
}

/**
 * シングルトンAPIクライアントインスタンス
 */
export const apiClient = new APIClient()
