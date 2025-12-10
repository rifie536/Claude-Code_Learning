'use client'

import { useEffect, useRef } from 'react'
import type { Message } from '@/types'
import { ChatMessage } from './ChatMessage'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export interface ChatContainerProps {
  messages: Message[]
  isLoading: boolean
  streamingContent?: string
}

/**
 * チャットメッセージ一覧コンテナ
 * メッセージリストの表示と自動スクロールを管理
 */
export function ChatContainer({ messages, isLoading, streamingContent }: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 新しいメッセージやストリーミングコンテンツが追加されたら自動スクロール
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, streamingContent])

  if (messages.length === 0 && !isLoading && !streamingContent) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 text-blue-600 dark:text-blue-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            新しい会話を始めましょう
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            メッセージを入力して、AIアシスタントとの会話を開始してください。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* 既存のメッセージ */}
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* ストリーミング中のメッセージ */}
        {streamingContent && (
          <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-green-600 dark:bg-green-500 text-white">
                AI
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{streamingContent}</p>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span className="text-xs text-gray-500 dark:text-gray-400">応答中...</span>
              </div>
            </div>
          </div>
        )}

        {/* ローディング表示（メッセージがない場合） */}
        {isLoading && !streamingContent && messages.length === 0 && (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* 自動スクロール用のアンカー */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
