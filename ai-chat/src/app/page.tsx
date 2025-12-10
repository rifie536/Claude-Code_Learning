'use client'

import { useRouter } from 'next/navigation'
import { useConversations } from '@/hooks/useConversations'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

export default function Home() {
  const router = useRouter()
  const { conversations, isLoading, error, createConversation } = useConversations()

  const handleNewChat = async () => {
    const conversation = await createConversation()
    if (conversation) {
      router.push(`/chat/${conversation.id}`)
    }
  }

  const handleExistingChat = (id: string) => {
    router.push(`/chat/${id}`)
  }

  if (isLoading && conversations.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            AI Chat
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Powered by Claude API & Mastra
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <button
            onClick={handleNewChat}
            disabled={isLoading}
            className="
              w-full
              flex items-center justify-center gap-3
              px-6 py-4
              bg-blue-600 hover:bg-blue-700
              disabled:bg-gray-300 dark:disabled:bg-gray-700
              text-white
              rounded-xl
              font-semibold text-lg
              transition-all
              hover:shadow-lg
              disabled:cursor-not-allowed
              mb-8
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            新しいチャットを始める
          </button>

          {conversations.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                最近の会話
              </h2>
              <div className="space-y-2">
                {conversations.slice(0, 5).map(conversation => {
                  const title =
                    conversation.title ||
                    conversation.messages[0]?.content.substring(0, 50) ||
                    '新しい会話'

                  return (
                    <button
                      key={conversation.id}
                      onClick={() => handleExistingChat(conversation.id)}
                      className="
                        w-full
                        text-left
                        px-4 py-3
                        rounded-lg
                        bg-gray-50 dark:bg-gray-700/50
                        hover:bg-gray-100 dark:hover:bg-gray-700
                        border border-gray-200 dark:border-gray-600
                        transition-colors
                      "
                    >
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(conversation.updatedAt).toLocaleDateString('ja-JP', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
