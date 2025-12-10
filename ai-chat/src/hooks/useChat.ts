'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Message, StreamChunk } from '@/types'
import { apiClient } from '@/lib/api/client'

export interface UseChatOptions {
  conversationId?: string
  initialMessages?: Message[]
}

export interface UseChatReturn {
  messages: Message[]
  isLoading: boolean
  error: string | null
  streamingContent: string
  sendMessage: (content: string) => Promise<void>
  clearError: () => void
}

/**
 * チャット機能を提供するカスタムフック
 * メッセージ送信、ストリーミング受信、エラーハンドリングを管理
 */
export function useChat({ conversationId, initialMessages = [] }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [streamingContent, setStreamingContent] = useState('')
  const [currentConversationId, setCurrentConversationId] = useState(conversationId)

  // 初期メッセージの更新を監視
  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  // conversationIdの変更を監視
  useEffect(() => {
    setCurrentConversationId(conversationId)
  }, [conversationId])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      if (isLoading) return

      setIsLoading(true)
      setError(null)
      setStreamingContent('')

      // ユーザーメッセージを即座に追加
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId: currentConversationId || '',
        role: 'user',
        content,
        createdAt: new Date(),
      }
      setMessages(prev => [...prev, userMessage])

      try {
        // ストリーミングレスポンスを取得
        const stream = await apiClient.sendMessage(currentConversationId, content)
        const reader = stream.getReader()

        let fullContent = ''
        let newConversationId = currentConversationId
        let assistantMessageId = ''

        while (true) {
          const { done, value } = await reader.read()

          if (done) break

          const chunk: StreamChunk = value

          switch (chunk.type) {
            case 'start':
              // 新規会話の場合、会話IDを更新
              if (!currentConversationId && chunk.content) {
                newConversationId = chunk.content
                setCurrentConversationId(newConversationId)
                // URLを更新（ブラウザ履歴に追加せず）
                window.history.replaceState(null, '', `/chat/${newConversationId}`)
              }
              break

            case 'text':
              // ストリーミングコンテンツを更新
              if (chunk.content) {
                fullContent += chunk.content
                setStreamingContent(fullContent)
              }
              break

            case 'end':
              // ストリーミング完了時、メッセージIDを取得
              if (chunk.messageId) {
                assistantMessageId = chunk.messageId
              }
              break

            case 'error':
              throw new Error(chunk.error || 'ストリーミングエラーが発生しました')
          }
        }

        // ストリーミング完了後、アシスタントメッセージを追加
        if (fullContent) {
          const assistantMessage: Message = {
            id: assistantMessageId || `temp-ai-${Date.now()}`,
            conversationId: newConversationId || '',
            role: 'assistant',
            content: fullContent,
            createdAt: new Date(),
          }
          setMessages(prev => [...prev, assistantMessage])
        }

        setStreamingContent('')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました'
        setError(errorMessage)
        console.error('Chat error:', err)

        // エラー時はユーザーメッセージを削除
        setMessages(prev => prev.slice(0, -1))
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, currentConversationId]
  )

  return {
    messages,
    isLoading,
    error,
    streamingContent,
    sendMessage,
    clearError,
  }
}
