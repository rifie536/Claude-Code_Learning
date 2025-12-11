'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-2xl text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-12 h-12 text-blue-600 dark:text-blue-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-6xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            404
          </h1>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            ページが見つかりません
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            お探しのページは存在しないか、移動した可能性があります。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
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

          <button
            onClick={() => window.history.back()}
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
            data-testid="go-back-button"
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
                d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
              />
            </svg>
            前のページに戻る
          </button>
        </div>
      </div>
    </main>
  )
}
