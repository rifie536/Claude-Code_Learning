import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useConversations } from '@/hooks/useConversations'
import { apiClient } from '@/lib/api/client'
import type { Conversation } from '@/types'

// APIクライアントをモック
vi.mock('@/lib/api/client', () => ({
  apiClient: {
    getConversations: vi.fn(),
    createConversation: vi.fn(),
    deleteConversation: vi.fn(),
  },
}))

describe('useConversations', () => {
  const mockConversations: Conversation[] = [
    {
      id: '1',
      title: 'Conversation 1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      messages: [],
    },
    {
      id: '2',
      title: 'Conversation 2',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      messages: [],
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches conversations on mount', async () => {
    vi.mocked(apiClient.getConversations).mockResolvedValue(mockConversations)

    const { result } = renderHook(() => useConversations())

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.conversations).toEqual(mockConversations)
    expect(apiClient.getConversations).toHaveBeenCalledTimes(1)
  })

  it('handles error when fetching conversations', async () => {
    const error = new Error('Failed to fetch')
    vi.mocked(apiClient.getConversations).mockRejectedValue(error)

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to fetch')
    expect(result.current.conversations).toEqual([])
  })

  it('creates a new conversation', async () => {
    const newConversation: Conversation = {
      id: '3',
      title: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
    }

    vi.mocked(apiClient.getConversations).mockResolvedValue(mockConversations)
    vi.mocked(apiClient.createConversation).mockResolvedValue(newConversation)

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const created = await result.current.createConversation()

    expect(created).toEqual(newConversation)
    expect(result.current.conversations).toContainEqual(newConversation)
    expect(apiClient.createConversation).toHaveBeenCalledTimes(1)
  })

  it('handles error when creating conversation', async () => {
    const error = new Error('Failed to create')
    vi.mocked(apiClient.getConversations).mockResolvedValue(mockConversations)
    vi.mocked(apiClient.createConversation).mockRejectedValue(error)

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const created = await result.current.createConversation()

    expect(created).toBeNull()
    expect(result.current.error).toBe('Failed to create')
  })

  it('deletes a conversation', async () => {
    vi.mocked(apiClient.getConversations).mockResolvedValue(mockConversations)
    vi.mocked(apiClient.deleteConversation).mockResolvedValue()

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await result.current.deleteConversation('1')

    await waitFor(() => {
      expect(result.current.conversations).not.toContainEqual(
        expect.objectContaining({ id: '1' })
      )
    })

    expect(apiClient.deleteConversation).toHaveBeenCalledWith('1')
  })

  it('handles error when deleting conversation', async () => {
    const error = new Error('Failed to delete')
    vi.mocked(apiClient.getConversations).mockResolvedValue(mockConversations)
    vi.mocked(apiClient.deleteConversation).mockRejectedValue(error)

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await result.current.deleteConversation('1')

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to delete')
    })

    // 削除失敗時は会話を再取得
    expect(apiClient.getConversations).toHaveBeenCalledTimes(2)
  })

  it('refreshes conversations', async () => {
    vi.mocked(apiClient.getConversations).mockResolvedValue(mockConversations)

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await result.current.refreshConversations()

    // 初回マウント時とrefresh時の2回呼ばれる
    expect(apiClient.getConversations).toHaveBeenCalledTimes(2)
  })

  it('clears error', async () => {
    const error = new Error('Test error')
    vi.mocked(apiClient.getConversations).mockRejectedValue(error)

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.error).toBe('Test error')
    })

    result.current.clearError()

    expect(result.current.error).toBeNull()
  })
})
