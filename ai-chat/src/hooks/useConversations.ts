'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Conversation } from '@/types'
import { apiClient } from '@/lib/api/client'

export interface UseConversationsReturn {
  conversations: Conversation[]
  isLoading: boolean
  error: string | null
  createConversation: () => Promise<Conversation | null>
  deleteConversation: (id: string) => Promise<void>
  refreshConversations: () => Promise<void>
  clearError: () => void
}

/**
 * 会話管理機能を提供するカスタムフック
 * 会話一覧の取得、作成、削除を管理
 */
export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // 会話一覧を取得
  const refreshConversations = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await apiClient.getConversations()
      setConversations(data)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '会話の取得に失敗しました'
      setError(errorMessage)
      console.error('Failed to fetch conversations:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 初回マウント時に会話を取得
  useEffect(() => {
    refreshConversations()
  }, [refreshConversations])

  // 新規会話を作成
  const createConversation = useCallback(async (): Promise<Conversation | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const newConversation = await apiClient.createConversation()
      setConversations(prev => [newConversation, ...prev])
      return newConversation
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '会話の作成に失敗しました'
      setError(errorMessage)
      console.error('Failed to create conversation:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 会話を削除
  const deleteConversation = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)

      try {
        await apiClient.deleteConversation(id)
        setConversations(prev => prev.filter(conv => conv.id !== id))
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '会話の削除に失敗しました'
        setError(errorMessage)
        console.error('Failed to delete conversation:', err)

        // エラー時は会話一覧を再取得
        await refreshConversations()
      } finally {
        setIsLoading(false)
      }
    },
    [refreshConversations]
  )

  return {
    conversations,
    isLoading,
    error,
    createConversation,
    deleteConversation,
    refreshConversations,
    clearError,
  }
}
