'use client'

import type { Message } from '@/types'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useState } from 'react'

export interface ChatMessageProps {
  message: Message
}

/**
 * チャットメッセージコンポーネント
 * ユーザーとアシスタントのメッセージを表示
 */
export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)

  const isUser = message.role === 'user'

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={`
        flex gap-4 p-4
        ${isUser ? 'bg-transparent' : 'bg-gray-50 dark:bg-gray-800/50'}
      `}
    >
      {/* アバター */}
      <div className="flex-shrink-0">
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
            ${
              isUser
                ? 'bg-blue-600 text-white'
                : 'bg-green-600 dark:bg-green-500 text-white'
            }
          `}
        >
          {isUser ? 'U' : 'AI'}
        </div>
      </div>

      {/* メッセージ内容 */}
      <div className="flex-1 min-w-0">
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              code({ className, children }) {
                const match = /language-(\w+)/.exec(className || '')
                const codeString = String(children).replace(/\n$/, '')
                const isInline = !match

                return !isInline ? (
                  <div className="relative group">
                    <button
                      onClick={() => handleCopyCode(codeString)}
                      className="
                        absolute right-2 top-2
                        px-2 py-1
                        bg-gray-700 hover:bg-gray-600
                        text-white text-xs rounded
                        opacity-0 group-hover:opacity-100
                        transition-opacity
                      "
                      aria-label="コードをコピー"
                    >
                      {copied ? 'コピーしました!' : 'コピー'}
                    </button>
                    <SyntaxHighlighter
                      style={oneDark as any}
                      language={match[1]}
                      PreTag="div"
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className={className}>{children}</code>
                )
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* タイムスタンプ */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {new Date(message.createdAt).toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  )
}
