import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatMessage } from '@/components/chat/ChatMessage'
import type { Message } from '@/types'

// クリップボードAPIのモック
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
})

describe('ChatMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ユーザーメッセージ', () => {
    const userMessage: Message = {
      id: '1',
      conversationId: 'conv-1',
      role: 'user',
      content: 'こんにちは',
      createdAt: new Date('2024-01-01T10:30:00'),
    }

    it('ユーザーメッセージを正しく表示する', () => {
      render(<ChatMessage message={userMessage} />)

      expect(screen.getByText('こんにちは')).toBeInTheDocument()
      expect(screen.getByText('U')).toBeInTheDocument()
      expect(screen.getByText('10:30')).toBeInTheDocument()
    })

    it('ユーザーメッセージの背景が透明である', () => {
      const { container } = render(<ChatMessage message={userMessage} />)

      const messageContainer = container.firstChild as HTMLElement
      expect(messageContainer).toHaveClass('bg-transparent')
    })

    it('ユーザーアバターが青色である', () => {
      render(<ChatMessage message={userMessage} />)

      const avatar = screen.getByText('U').parentElement
      expect(avatar).toHaveClass('bg-blue-600')
    })
  })

  describe('アシスタントメッセージ', () => {
    const assistantMessage: Message = {
      id: '2',
      conversationId: 'conv-1',
      role: 'assistant',
      content: 'こんにちは！どのようにお手伝いできますか？',
      createdAt: new Date('2024-01-01T10:31:00'),
    }

    it('アシスタントメッセージを正しく表示する', () => {
      render(<ChatMessage message={assistantMessage} />)

      expect(screen.getByText('こんにちは！どのようにお手伝いできますか？')).toBeInTheDocument()
      expect(screen.getByText('AI')).toBeInTheDocument()
      expect(screen.getByText('10:31')).toBeInTheDocument()
    })

    it('アシスタントメッセージの背景が灰色である', () => {
      const { container } = render(<ChatMessage message={assistantMessage} />)

      const messageContainer = container.firstChild as HTMLElement
      expect(messageContainer).toHaveClass('bg-gray-50')
    })

    it('アシスタントアバターが緑色である', () => {
      render(<ChatMessage message={assistantMessage} />)

      const avatar = screen.getByText('AI').parentElement
      expect(avatar).toHaveClass('bg-green-600')
    })
  })

  describe('Markdown表示', () => {
    it('太字を正しく表示する', () => {
      const message: Message = {
        id: '3',
        conversationId: 'conv-1',
        role: 'assistant',
        content: 'これは**太字**のテキストです',
        createdAt: new Date(),
      }

      const { container } = render(<ChatMessage message={message} />)

      const strongElement = container.querySelector('strong')
      expect(strongElement).toHaveTextContent('太字')
    })

    it('リストを正しく表示する', () => {
      const message: Message = {
        id: '4',
        conversationId: 'conv-1',
        role: 'assistant',
        content: '- アイテム1\n- アイテム2\n- アイテム3',
        createdAt: new Date(),
      }

      const { container } = render(<ChatMessage message={message} />)

      const listItems = container.querySelectorAll('li')
      expect(listItems).toHaveLength(3)
      expect(listItems[0]).toHaveTextContent('アイテム1')
      expect(listItems[1]).toHaveTextContent('アイテム2')
      expect(listItems[2]).toHaveTextContent('アイテム3')
    })

    it('リンクを正しく表示する', () => {
      const message: Message = {
        id: '5',
        conversationId: 'conv-1',
        role: 'assistant',
        content: 'こちらをクリック: [リンク](https://example.com)',
        createdAt: new Date(),
      }

      render(<ChatMessage message={message} />)

      const link = screen.getByText('リンク')
      expect(link).toHaveAttribute('href', 'https://example.com')
    })
  })

  describe('コードブロック', () => {
    it('インラインコードを正しく表示する', () => {
      const message: Message = {
        id: '6',
        conversationId: 'conv-1',
        role: 'assistant',
        content: '`const x = 1` というコードです',
        createdAt: new Date(),
      }

      const { container } = render(<ChatMessage message={message} />)

      const codeElement = container.querySelector('code')
      expect(codeElement).toHaveTextContent('const x = 1')
    })

    it('コードブロックを正しく表示する', () => {
      const message: Message = {
        id: '7',
        conversationId: 'conv-1',
        role: 'assistant',
        content: '```javascript\nconst x = 1;\nconsole.log(x);\n```',
        createdAt: new Date(),
      }

      render(<ChatMessage message={message} />)

      expect(screen.getByText(/const x = 1/)).toBeInTheDocument()
      expect(screen.getByText(/console.log\(x\)/)).toBeInTheDocument()
    })

    it('コードブロックにコピーボタンが表示される', () => {
      const message: Message = {
        id: '8',
        conversationId: 'conv-1',
        role: 'assistant',
        content: '```python\nprint("Hello")\n```',
        createdAt: new Date(),
      }

      render(<ChatMessage message={message} />)

      const copyButton = screen.getByRole('button', { name: 'コードをコピー' })
      expect(copyButton).toBeInTheDocument()
    })

    it('コピーボタンをクリックするとクリップボードにコピーされる', async () => {
      const user = userEvent.setup()
      const message: Message = {
        id: '9',
        conversationId: 'conv-1',
        role: 'assistant',
        content: '```javascript\nconst hello = "world";\n```',
        createdAt: new Date(),
      }

      render(<ChatMessage message={message} />)

      const copyButton = screen.getByRole('button', { name: 'コードをコピー' })
      await user.click(copyButton)

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('const hello = "world";')
    })

    it('コピー後にボタンのテキストが変わる', async () => {
      const user = userEvent.setup()
      const message: Message = {
        id: '10',
        conversationId: 'conv-1',
        role: 'assistant',
        content: '```typescript\ntype User = { name: string };\n```',
        createdAt: new Date(),
      }

      render(<ChatMessage message={message} />)

      const copyButton = screen.getByRole('button', { name: 'コードをコピー' })
      await user.click(copyButton)

      expect(copyButton).toHaveTextContent('コピーしました!')

      // 2秒後に元に戻る
      await waitFor(
        () => {
          expect(copyButton).toHaveTextContent('コピー')
        },
        { timeout: 2500 }
      )
    })
  })

  describe('タイムスタンプ', () => {
    it('正しい時刻形式でタイムスタンプを表示する', () => {
      const message: Message = {
        id: '11',
        conversationId: 'conv-1',
        role: 'user',
        content: 'テスト',
        createdAt: new Date('2024-01-01T14:35:00'),
      }

      render(<ChatMessage message={message} />)

      expect(screen.getByText('14:35')).toBeInTheDocument()
    })

    it('午前の時刻を正しく表示する', () => {
      const message: Message = {
        id: '12',
        conversationId: 'conv-1',
        role: 'user',
        content: 'テスト',
        createdAt: new Date('2024-01-01T09:05:00'),
      }

      render(<ChatMessage message={message} />)

      expect(screen.getByText('09:05')).toBeInTheDocument()
    })
  })

  describe('アクセシビリティ', () => {
    it('コピーボタンに適切なaria-labelがある', () => {
      const message: Message = {
        id: '13',
        conversationId: 'conv-1',
        role: 'assistant',
        content: '```bash\nls -la\n```',
        createdAt: new Date(),
      }

      render(<ChatMessage message={message} />)

      const copyButton = screen.getByRole('button', { name: 'コードをコピー' })
      expect(copyButton).toHaveAttribute('aria-label', 'コードをコピー')
    })
  })
})
