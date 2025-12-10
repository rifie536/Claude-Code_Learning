/**
 * ローディングスピナーコンポーネント
 */
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          border-gray-300
          border-t-blue-600
          dark:border-gray-600
          dark:border-t-blue-400
          rounded-full
          animate-spin
        `}
        role="status"
        aria-label="読み込み中"
      />
    </div>
  )
}
