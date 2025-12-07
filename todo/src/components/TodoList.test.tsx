import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoList } from './TodoList'
import type { Todo } from '../types/Todo'

describe('TodoList', () => {
  it('Todoがない場合、空のメッセージを表示する', () => {
    render(<TodoList todos={[]} onToggle={() => {}} onDelete={() => {}} />)
    expect(screen.getByText('Todoがありません')).toBeInTheDocument()
  })

  it('Todoリストを表示する', () => {
    const todos: Todo[] = [
      { id: '1', text: 'テスト1', completed: false },
      { id: '2', text: 'テスト2', completed: true },
    ]
    render(<TodoList todos={todos} onToggle={() => {}} onDelete={() => {}} />)

    expect(screen.getByText('テスト1')).toBeInTheDocument()
    expect(screen.getByText('テスト2')).toBeInTheDocument()
  })

  it('完了したTodoには打ち消し線が表示される', () => {
    const todos: Todo[] = [
      { id: '1', text: '完了済み', completed: true },
    ]
    render(<TodoList todos={todos} onToggle={() => {}} onDelete={() => {}} />)

    const todoText = screen.getByText('完了済み')
    expect(todoText).toHaveClass('line-through')
  })

  it('チェックボックスをクリックするとonToggleが呼ばれる', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    const todos: Todo[] = [
      { id: '1', text: 'テスト', completed: false },
    ]
    render(<TodoList todos={todos} onToggle={onToggle} onDelete={() => {}} />)

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(onToggle).toHaveBeenCalledWith('1')
  })

  it('削除ボタンをクリックするとonDeleteが呼ばれる', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const todos: Todo[] = [
      { id: '1', text: 'テスト', completed: false },
    ]
    render(<TodoList todos={todos} onToggle={() => {}} onDelete={onDelete} />)

    const deleteButton = screen.getByRole('button', { name: '削除' })
    await user.click(deleteButton)

    expect(onDelete).toHaveBeenCalledWith('1')
  })
})
