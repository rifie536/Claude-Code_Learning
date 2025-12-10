'use client'

import type { Conversation } from '@/types'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export interface ChatSidebarProps {
  conversations: Conversation[]
  onNewChat: () => void
  onDeleteConversation: (id: string) => void
  isLoading?: boolean
}

/**
 * チャットサイドバーコンポーネント
 * 会話履歴一覧と新規会話作成を管理
 */
export function ChatSidebar({
  conversations,
  onNewChat,
  onDeleteConversation,
  isLoading = false,
}: ChatSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const formatDate = (date: Date) => {
    const now = new Date()
    const messageDate = new Date(date)
    const diffInDays = Math.floor(
      (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffInDays === 0) return '今日'
    if (diffInDays === 1) return '昨日'
    if (diffInDays < 7) return `${diffInDays}日前`

    return messageDate.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    })
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onNewChat}
          disabled={isLoading}
          className="
            w-full
            flex items-center justify-center gap-2
            px-4 py-3
            bg-blue-600 hover:bg-blue-700
            disabled:bg-gray-300 dark:disabled:bg-gray-700
            text-white
            rounded-lg
            font-medium
            transition-colors
            disabled:cursor-not-allowed
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          新しいチャット
        </button>
      </div>

      {/* 会話リスト */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8 px-4">
            会話履歴がありません
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map(conversation => {
              const isActive = pathname === `/chat/${conversation.id}`
              const title =
                conversation.title ||
                conversation.messages[0]?.content.substring(0, 30) ||
                '新しい会話'

              return (
                <div key={conversation.id} className="group relative">
                  <Link
                    href={`/chat/${conversation.id}`}
                    className={`
                      block
                      px-3 py-2
                      rounded-lg
                      text-sm
                      transition-colors
                      ${
                        isActive
                          ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {formatDate(conversation.updatedAt)}
                        </p>
                      </div>
                      <button
                        onClick={e => {
                          e.preventDefault()
                          if (confirm('この会話を削除しますか？')) {
                            onDeleteConversation(conversation.id)
                          }
                        }}
                        className="
                          opacity-0 group-hover:opacity-100
                          p-1
                          hover:bg-red-100 dark:hover:bg-red-900/30
                          text-red-600 dark:text-red-400
                          rounded
                          transition-all
                        "
                        aria-label="削除"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* フッター */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">テーマ</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* モバイル用ハンバーガーメニュー */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          lg:hidden
          fixed top-4 left-4 z-50
          p-2
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-lg
          shadow-lg
        "
        aria-label="メニュー"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* モバイルオーバーレイ */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          aria-hidden="true"
        />
      )}

      {/* サイドバー本体 */}
      <aside
        className={`
          fixed lg:static
          inset-y-0 left-0
          z-40
          w-64
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
