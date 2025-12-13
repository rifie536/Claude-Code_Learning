import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatInput } from '@/components/chat/ChatInput'

describe('ChatInput', () => {
  const defaultProps = {
    onSendMessage: vi.fn(),
    isLoading: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('レンダリング', () => {
    it('テキストエリアと送信ボタンを表示する', () => {
      render(<ChatInput {...defaultProps} />)

      expect(screen.getByPlaceholderText(/メッセージを入力/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '送信' })).toBeInTheDocument()
    })

    it('ヘルプテキストを表示する', () => {
      render(<ChatInput {...defaultProps} />)

      expect(screen.getByText(/Enterで送信、Shift\+Enterで改行/)).toBeInTheDocument()
    })
  })

  describe('メッセージ入力', () => {
    it('テキストを入力できる', async () => {
      const user = userEvent.setup()
      render(<ChatInput {...defaultProps} />)

      const textarea = screen.getByPlaceholderText(/メッセージを入力/)
      await user.type(textarea, 'テストメッセージ')

      expect(textarea).toHaveValue('テストメッセージ')
    })

    it('複数行のテキストを入力できる', async () => {
      const user = userEvent.setup()
      render(<ChatInput {...defaultProps} />)

      const textarea = screen.getByPlaceholderText(/メッセージを入力/)
      await user.type(textarea, '1行目{Shift>}{Enter}{/Shift}2行目')

      expect(textarea).toHaveValue('1行目\n2行目')
    })
  })

  describe('メッセージ送信', () => {
    it('送信ボタンをクリックしてメッセージを送信できる', async () => {
      const user = userEvent.setup()
      const onSendMessage = vi.fn()
      render(<ChatInput {...defaultProps} onSendMessage={onSendMessage} />)

      const textarea = screen.getByPlaceholderText(/メッセージを入力/)
      const button = screen.getByRole('button', { name: '送信' })

      await user.type(textarea, 'こんにちは')
      await user.click(button)

      expect(onSendMessage).toHaveBeenCalledWith('こんにちは')
      expect(onSendMessage).toHaveBeenCalledTimes(1)
    })

    it('Enterキーでメッセージを送信できる', async () => {
      const user = userEvent.setup()
      const onSendMessage = vi.fn()
      render(<ChatInput {...defaultProps} onSendMessage={onSendMessage} />)

      const textarea = screen.getByPlaceholderText(/メッセージを入力/)

      await user.type(textarea, 'Enterで送信')
      await user.keyboard('{Enter}')

      expect(onSendMessage).toHaveBeenCalledWith('Enterで送信')
    })

    it('Shift+Enterでは送信せず改行する', async () => {
      const user = userEvent.setup()
      const onSendMessage = vi.fn()
      render(<ChatInput {...defaultProps} onSendMessage={onSendMessage} />)

      const textarea = screen.getByPlaceholderText(/メッセージを入力/)

      await user.type(textarea, '1行目{Shift>}{Enter}{/Shift}2行目')

      expect(onSendMessage).not.toHaveBeenCalled()
      expect(textarea).toHaveValue('1行目\n2行目')
    })

    it('送信後にテキストエリアをクリアする', async () => {
      const user = userEvent.setup()
      const onSendMessage = vi.fn()
      render(<ChatInput {...defaultProps} onSendMessage={onSendMessage} />)

      const textarea = screen.getByPlaceholderText(/メッセージを入力/)
      const button = screen.getByRole('button', { name: '送信' })

      await user.type(textarea, 'メッセージ')
      await user.click(button)

      expect(textarea).toHaveValue('')
    })

    it('前後の空白をトリムして送信する', async () => {
      const user = userEvent.setup()
      const onSendMessage = vi.fn()
      render(<ChatInput {...defaultProps} onSendMessage={onSendMessage} />)

      const textarea = screen.getByPlaceholderText(/メッセージを入力/)
      const button = screen.getByRole('button', { name: '送信' })

      await user.type(textarea, '  メッセージ  ')
      await user.click(button)

      expect(onSendMessage).toHaveBeenCalledWith('メッセージ')
    })
  })

  describe('バリデーション', () => {
    it('空白のみのメッセージは送信できない', async () => {
      const user = userEvent.setup()
      const onSendMessage = vi.fn()
      render(<ChatInput {...defaultProps} onSendMessage={onSendMessage} />)

      const textarea = screen.getByPlaceholderText(/メッセージを入力/)
      const button = screen.getByRole('button', { name: '送信' })

      await user.type(textarea, '   ')
      await user.click(button)

      expect(onSendMessage).not.toHaveBeenCalled()
    })

    it('メッセージが空の場合、送信ボタンが無効化される', () => {
      render(<ChatInput {...defaultProps} />)

      const button = screen.getByRole('button', { name: '送信' })

      expect(button).toBeDisabled()
    })

    it('メッセージがある場合、送信ボタンが有効化される', async () => {
      const user = userEvent.setup()
      render(<ChatInput {...defaultProps} />)

      const textarea = screen.getByPlaceholderText(/メッセージを入力/)
      const button = screen.getByRole('button', { name: '送信' })

      expect(button).toBeDisabled()

      await user.type(textarea, 'メッセージ')

      expect(button).not.toBeDisabled()
    })
  })

  describe('ローディング状態', () => {
    it('ローディング中はテキストエリアが無効化される', () => {
      render(<ChatInput {...defaultProps} isLoading={true} />)

      const textarea = screen.getByPlaceholderText(/メッセージを入力/)

      expect(textarea).toBeDisabled()
    })

    it('ローディング中は送信ボタンが無効化される', () => {
      render(<ChatInput {...defaultProps} isLoading={true} />)

      const button = screen.getByRole('button', { name: '送信' })

      expect(button).toBeDisabled()
    })

    it('ローディング中は送信処理が実行されない', async () => {
      const user = userEvent.setup()
      const onSendMessage = vi.fn()
      const { rerender } = render(
        <ChatInput {...defaultProps} onSendMessage={onSendMessage} />
      )

      const textarea = screen.getByPlaceholderText(/メッセージを入力/)

      // メッセージを入力
      await user.type(textarea, 'メッセージ')

      // ローディング状態に変更
      rerender(<ChatInput {...defaultProps} onSendMessage={onSendMessage} isLoading={true} />)

      // Enterキーを押す
      fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' })

      expect(onSendMessage).not.toHaveBeenCalled()
    })
  })

  describe('無効化状態', () => {
    it('disabled時はテキストエリアが無効化される', () => {
      render(<ChatInput {...defaultProps} disabled={true} />)

      const textarea = screen.getByPlaceholderText(/メッセージを入力/)

      expect(textarea).toBeDisabled()
    })

    it('disabled時は送信ボタンが無効化される', () => {
      render(<ChatInput {...defaultProps} disabled={true} />)

      const button = screen.getByRole('button', { name: '送信' })

      expect(button).toBeDisabled()
    })

    it('disabled時は送信処理が実行されない', async () => {
      const user = userEvent.setup()
      const onSendMessage = vi.fn()
      const { rerender } = render(
        <ChatInput {...defaultProps} onSendMessage={onSendMessage} />
      )

      const textarea = screen.getByPlaceholderText(/メッセージを入力/)

      // メッセージを入力
      await user.type(textarea, 'メッセージ')

      // 無効化状態に変更
      rerender(<ChatInput {...defaultProps} onSendMessage={onSendMessage} disabled={true} />)

      // Enterキーを押す
      fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' })

      expect(onSendMessage).not.toHaveBeenCalled()
    })
  })
})
