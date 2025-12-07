import type { Todo } from '../types/Todo'

interface TodoListProps {
  todos: Todo[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return <p className="text-gray-500 text-center">Todoがありません</p>
  }

  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        <li
          key={todo.id}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
        >
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            className="w-5 h-5 text-blue-500"
          />
          <span
            className={`flex-1 ${
              todo.completed ? 'line-through text-gray-400' : 'text-gray-700'
            }`}
          >
            {todo.text}
          </span>
          <button
            onClick={() => onDelete(todo.id)}
            className="text-red-500 hover:text-red-700 px-2 py-1 text-sm"
          >
            削除
          </button>
        </li>
      ))}
    </ul>
  )
}
