import { render, screen, fireEvent } from '@testing-library/react';
import { TodoList } from './TodoList';
import { Todo } from '@/types/todo';

describe('TodoList', () => {
  const mockTodos: Todo[] = [
    {
      id: '1',
      title: 'タスク1',
      completed: false,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      title: 'タスク2',
      completed: true,
      createdAt: new Date('2024-01-02'),
    },
  ];

  const mockOnAdd = jest.fn();
  const mockOnToggle = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('すべてのTODOが表示される', () => {
    render(
      <TodoList
        todos={mockTodos}
        onAdd={mockOnAdd}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getByText('タスク1')).toBeInTheDocument();
    expect(screen.getByText('タスク2')).toBeInTheDocument();
  });

  it('入力フィールドとボタンが表示される', () => {
    render(
      <TodoList
        todos={mockTodos}
        onAdd={mockOnAdd}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getByPlaceholderText('新しいタスクを入力')).toBeInTheDocument();
    expect(screen.getByText('追加')).toBeInTheDocument();
  });

  it('タスクを追加するとonAddが呼ばれる', () => {
    render(
      <TodoList
        todos={mockTodos}
        onAdd={mockOnAdd}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );
    const input = screen.getByPlaceholderText('新しいタスクを入力');
    const addButton = screen.getByText('追加');

    fireEvent.change(input, { target: { value: '新しいタスク' } });
    fireEvent.click(addButton);

    expect(mockOnAdd).toHaveBeenCalledWith('新しいタスク');
  });

  it('タスク追加後、入力フィールドがクリアされる', () => {
    render(
      <TodoList
        todos={mockTodos}
        onAdd={mockOnAdd}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );
    const input = screen.getByPlaceholderText('新しいタスクを入力') as HTMLInputElement;
    const addButton = screen.getByText('追加');

    fireEvent.change(input, { target: { value: '新しいタスク' } });
    fireEvent.click(addButton);

    expect(input.value).toBe('');
  });

  it('空のタスクは追加できない', () => {
    render(
      <TodoList
        todos={mockTodos}
        onAdd={mockOnAdd}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );
    const addButton = screen.getByText('追加');

    fireEvent.click(addButton);

    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('TODOがない場合、メッセージが表示される', () => {
    render(
      <TodoList
        todos={[]}
        onAdd={mockOnAdd}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
  });
});
