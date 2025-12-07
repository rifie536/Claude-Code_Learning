import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoForm } from './TodoForm'

describe('TodoForm', () => {
  it('入力フォームが表示される', () => {
    render(<TodoForm onAdd={() => {}} />)
    expect(screen.getByPlaceholderText('Todoを入力')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '追加' })).toBeInTheDocument()
  })

  it('Todoを入力して追加ボタンをクリックするとonAddが呼ばれる', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<TodoForm onAdd={onAdd} />)

    const input = screen.getByPlaceholderText('Todoを入力')
    await user.type(input, '新しいTodo')
    await user.click(screen.getByRole('button', { name: '追加' }))

    expect(onAdd).toHaveBeenCalledWith('新しいTodo')
  })

  it('追加後に入力フィールドがクリアされる', async () => {
    const user = userEvent.setup()
    render(<TodoForm onAdd={() => {}} />)

    const input = screen.getByPlaceholderText('Todoを入力')
    await user.type(input, '新しいTodo')
    await user.click(screen.getByRole('button', { name: '追加' }))

    expect(input).toHaveValue('')
  })

  it('空の入力では追加できない', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<TodoForm onAdd={onAdd} />)

    await user.click(screen.getByRole('button', { name: '追加' }))

    expect(onAdd).not.toHaveBeenCalled()
  })
})
