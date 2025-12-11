'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // エラーログをコンソールに出力（本番環境では外部サービスに送信することを推奨）
    console.error('Error caught by error boundary:', error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-2xl text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-12 h-12 text-red-600 dark:text-red-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            エラーが発生しました
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-2 text-lg">
            申し訳ございません。予期しないエラーが発生しました。
          </p>

          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="mt-6 mx-auto max-w-xl">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-left">
                <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
                  開発環境のエラー詳細:
                </p>
                <p className="text-sm text-red-700 dark:text-red-400 font-mono break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-red-600 dark:text-red-500 mt-2">
                    Error Digest: {error.digest}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="
              inline-flex items-center justify-center gap-2
              px-6 py-3
              bg-blue-600 hover:bg-blue-700
              text-white
              rounded-xl
              font-semibold
              transition-all
              hover:shadow-lg
            "
            data-testid="retry-button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            もう一度試す
          </button>

          <Link
            href="/"
            className="
              inline-flex items-center justify-center gap-2
              px-6 py-3
              bg-white dark:bg-gray-800
              text-gray-700 dark:text-gray-300
              border border-gray-300 dark:border-gray-600
              hover:bg-gray-50 dark:hover:bg-gray-700
              rounded-xl
              font-semibold
              transition-all
            "
            data-testid="back-to-home-button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
            ホームに戻る
          </Link>
        </div>
      </div>
    </main>
  )
}
