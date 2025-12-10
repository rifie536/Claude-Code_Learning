'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
  disabled?: boolean
}

/**
 * チャット入力コンポーネント
 * メッセージ入力とイベント送信を処理
 */
export function ChatInput({ onSendMessage, isLoading, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || isLoading || disabled) return

    onSendMessage(trimmedMessage)
    setMessage('')

    // テキストエリアの高さをリセット
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enterキーで送信（Shift+Enterで改行）
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)

    // 自動リサイズ
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力... (Shift+Enterで改行)"
            disabled={isLoading || disabled}
            rows={1}
            className="
              flex-1
              resize-none
              rounded-lg
              border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-800
              px-4 py-3
              text-gray-900 dark:text-gray-100
              placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
              max-h-40
              overflow-y-auto
            "
            style={{ minHeight: '52px' }}
          />
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading || disabled}
            className="
              flex-shrink-0
              px-4 py-3
              bg-blue-600 hover:bg-blue-700
              disabled:bg-gray-300 dark:disabled:bg-gray-700
              text-white
              rounded-lg
              font-medium
              transition-colors
              disabled:cursor-not-allowed
              h-[52px]
              min-w-[80px]
            "
            aria-label="送信"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 mx-auto"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Enterで送信、Shift+Enterで改行
        </p>
      </div>
    </div>
  )
}
