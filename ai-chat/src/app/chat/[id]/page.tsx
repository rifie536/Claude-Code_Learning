'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useChat } from '@/hooks/useChat'
import { useConversations } from '@/hooks/useConversations'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { ChatInput } from '@/components/chat/ChatInput'
import { ChatSidebar } from '@/components/chat/ChatSidebar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { apiClient } from '@/lib/api/client'
import type { Conversation } from '@/types'

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loadingConversation, setLoadingConversation] = useState(true)
  const [conversationError, setConversationError] = useState<string | null>(null)

  const {
    conversations,
    isLoading: conversationsLoading,
    createConversation,
    deleteConversation,
  } = useConversations()

  const {
    messages,
    isLoading: chatLoading,
    error: chatError,
    streamingContent,
    sendMessage,
    clearError,
  } = useChat({
    conversationId,
    initialMessages: conversation?.messages || [],
  })

  // 会話データを取得
  useEffect(() => {
    const loadConversation = async () => {
      setLoadingConversation(true)
      setConversationError(null)

      try {
        const data = await apiClient.getConversation(conversationId)
        setConversation(data)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '会話の読み込みに失敗しました'
        setConversationError(errorMessage)
        console.error('Failed to load conversation:', err)
      } finally {
        setLoadingConversation(false)
      }
    }

    if (conversationId) {
      loadConversation()
    }
  }, [conversationId])

  // 新規チャットを作成
  const handleNewChat = async () => {
    const newConversation = await createConversation()
    if (newConversation) {
      router.push(`/chat/${newConversation.id}`)
    }
  }

  // 会話を削除
  const handleDeleteConversation = async (id: string) => {
    await deleteConversation(id)

    // 削除した会話が現在の会話の場合、ホームにリダイレクト
    if (id === conversationId) {
      router.push('/')
    }
  }

  if (loadingConversation) {
    return (
      <div className="flex h-screen">
        <ChatSidebar
          conversations={conversations}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
          isLoading={conversationsLoading}
        />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (conversationError) {
    return (
      <div className="flex h-screen">
        <ChatSidebar
          conversations={conversations}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
          isLoading={conversationsLoading}
        />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md">
            <ErrorMessage
              message={conversationError}
              onRetry={() => router.push('/')}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      <ChatSidebar
        conversations={conversations}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        isLoading={conversationsLoading}
      />

      <div className="flex-1 flex flex-col">
        {/* ヘッダー */}
        <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {conversation?.title ||
                conversation?.messages[0]?.content.substring(0, 50) ||
                '新しい会話'}
            </h1>
          </div>
        </header>

        {/* エラー表示 */}
        {chatError && (
          <div className="px-4 pt-4 max-w-4xl mx-auto w-full">
            <ErrorMessage message={chatError} onRetry={clearError} />
          </div>
        )}

        {/* メッセージコンテナ */}
        <ChatContainer
          messages={messages}
          isLoading={chatLoading}
          streamingContent={streamingContent}
        />

        {/* 入力フォーム */}
        <ChatInput
          onSendMessage={sendMessage}
          isLoading={chatLoading}
          disabled={!!conversationError}
        />
      </div>
    </div>
  )
}
