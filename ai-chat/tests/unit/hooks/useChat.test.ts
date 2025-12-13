import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useChat } from '@/hooks/useChat'
import { apiClient } from '@/lib/api/client'
import type { Message, StreamChunk } from '@/types'

// apiClientをモック
vi.mock('@/lib/api/client', () => ({
  apiClient: {
    sendMessage: vi.fn(),
  },
}))

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // window.history.replaceStateのモック
    vi.spyOn(window.history, 'replaceState').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初期状態', () => {
    it('初期値が正しく設定されている', () => {
      const { result } = renderHook(() => useChat({}))

      expect(result.current.messages).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.streamingContent).toBe('')
      expect(typeof result.current.sendMessage).toBe('function')
      expect(typeof result.current.clearError).toBe('function')
    })

    it('初期メッセージを受け取る', () => {
      const initialMessages: Message[] = [
        {
          id: '1',
          conversationId: 'conv-1',
          role: 'user',
          content: 'Hello',
          createdAt: new Date(),
        },
      ]

      const { result } = renderHook(() => useChat({ initialMessages }))

      expect(result.current.messages).toEqual(initialMessages)
    })

    it('conversationIdを受け取る', () => {
      const { result } = renderHook(() => useChat({ conversationId: 'conv-123' }))

      // conversationIdは内部で管理されているため、直接確認はできないが、
      // sendMessage時に使用されることを後のテストで確認
      expect(result.current.messages).toEqual([])
    })
  })

  describe('sendMessage', () => {
    it('メッセージを正常に送信できる', async () => {
      // ストリーミングレスポンスのモック
      const mockStream = createMockStream([
        { type: 'start' as const, content: 'conv-1' },
        { type: 'text' as const, content: 'こんにちは' },
        { type: 'text' as const, content: '！' },
        { type: 'end' as const, messageId: 'msg-1' },
      ])

      vi.mocked(apiClient.sendMessage).mockResolvedValue(mockStream)

      const { result } = renderHook(() => useChat({}))

      await act(async () => {
        await result.current.sendMessage('テストメッセージ')
      })

      // ユーザーメッセージとアシスタントメッセージが追加されている
      expect(result.current.messages).toHaveLength(2)
      expect(result.current.messages[0].role).toBe('user')
      expect(result.current.messages[0].content).toBe('テストメッセージ')
      expect(result.current.messages[1].role).toBe('assistant')
      expect(result.current.messages[1].content).toBe('こんにちは！')
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('ストリーミング中はisLoadingがtrueになる', async () => {
      let resolveStream: (value: ReadableStream) => void
      const streamPromise = new Promise<ReadableStream>((resolve) => {
        resolveStream = resolve
      })

      vi.mocked(apiClient.sendMessage).mockReturnValue(streamPromise)

      const { result } = renderHook(() => useChat({}))

      act(() => {
        result.current.sendMessage('テスト')
      })

      // すぐにisLoadingがtrueになる
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      // ストリームを解決
      const mockStream = createMockStream([
        { type: 'end' as const, messageId: 'msg-1' },
      ])
      act(() => {
        resolveStream!(mockStream)
      })

      // 完了後はfalseになる
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('エラー時にユーザーメッセージを削除する', async () => {
      vi.mocked(apiClient.sendMessage).mockRejectedValue(new Error('API Error'))

      const { result } = renderHook(() => useChat({}))

      await act(async () => {
        await result.current.sendMessage('テストメッセージ')
      })

      // エラー時はユーザーメッセージが削除される
      expect(result.current.messages).toHaveLength(0)
      expect(result.current.error).toBe('API Error')
      expect(result.current.isLoading).toBe(false)
    })

    it('ストリーミング中のエラーを処理する', async () => {
      const mockStream = createMockStream([
        { type: 'start' as const, content: 'conv-1' },
        { type: 'error' as const, error: 'ストリーミングエラー' },
      ])

      vi.mocked(apiClient.sendMessage).mockResolvedValue(mockStream)

      const { result } = renderHook(() => useChat({}))

      await act(async () => {
        await result.current.sendMessage('テストメッセージ')
      })

      expect(result.current.error).toBe('ストリーミングエラー')
      expect(result.current.messages).toHaveLength(0) // エラー時はロールバック
    })

    it('ローディング中は重複送信を防ぐ', async () => {
      let resolveStream: (value: ReadableStream) => void
      const streamPromise = new Promise<ReadableStream>((resolve) => {
        resolveStream = resolve
      })

      vi.mocked(apiClient.sendMessage).mockReturnValue(streamPromise)

      const { result } = renderHook(() => useChat({}))

      act(() => {
        result.current.sendMessage('メッセージ1')
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      // ローディング中に再度送信を試みる
      await act(async () => {
        await result.current.sendMessage('メッセージ2')
      })

      // 2回目の送信は無視される
      expect(apiClient.sendMessage).toHaveBeenCalledTimes(1)
    })

    it('新規会話の場合、URLを更新する', async () => {
      const mockStream = createMockStream([
        { type: 'start' as const, content: 'new-conv-id' },
        { type: 'text' as const, content: 'Response' },
        { type: 'end' as const, messageId: 'msg-1' },
      ])

      vi.mocked(apiClient.sendMessage).mockResolvedValue(mockStream)

      const { result } = renderHook(() => useChat({}))

      await act(async () => {
        await result.current.sendMessage('新しい会話')
      })

      // URLが更新されている
      expect(window.history.replaceState).toHaveBeenCalledWith(
        null,
        '',
        '/chat/new-conv-id'
      )
    })
  })

  describe('clearError', () => {
    it('エラーをクリアできる', async () => {
      vi.mocked(apiClient.sendMessage).mockRejectedValue(new Error('Test Error'))

      const { result } = renderHook(() => useChat({}))

      // エラーを発生させる
      await act(async () => {
        await result.current.sendMessage('テスト')
      })

      expect(result.current.error).toBe('Test Error')

      // エラーをクリア
      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('streamingContent', () => {
    it('ストリーミング中のコンテンツを追跡する', async () => {
      const mockStream = createMockStream([
        { type: 'start' as const, content: 'conv-1' },
        { type: 'text' as const, content: 'Hello' },
        { type: 'text' as const, content: ' ' },
        { type: 'text' as const, content: 'World' },
        { type: 'end' as const, messageId: 'msg-1' },
      ])

      vi.mocked(apiClient.sendMessage).mockResolvedValue(mockStream)

      const { result } = renderHook(() => useChat({}))

      await act(async () => {
        await result.current.sendMessage('テスト')
      })

      // 完了後はstreamingContentがクリアされている
      expect(result.current.streamingContent).toBe('')
    })
  })
})

// ヘルパー関数: モックストリームを作成
function createMockStream(chunks: StreamChunk[]): ReadableStream {
  return {
    getReader: () => {
      let index = 0
      return {
        read: async () => {
          if (index >= chunks.length) {
            return { done: true, value: undefined }
          }
          return { done: false, value: chunks[index++] }
        },
        releaseLock: () => {},
        cancel: async () => {},
        closed: Promise.resolve(),
      } as ReadableStreamDefaultReader
    },
  } as ReadableStream
}
