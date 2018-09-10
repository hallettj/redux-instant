import { combineHandlers } from "redux-instant"

export interface State {
  todos: Todo[]
}

export interface Todo {
  complete: boolean
  id: ID
  title: string
}

type ID = number

// Make sure to annotate the type of your initial state.
const initState: State = { todos: [] }

export const { actions, reducer } = combineHandlers(
  "TodoApp", // namespace for Todo actions
  () => initState,
  {
    create(state: State, title: string) {
      return {
        ...state,
        todos: state.todos.concat({ complete: false, id: getId(), title })
      }
    },
    remove(state: State, id: ID) {
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== id)
      }
    },
    toggle(state: State, id: ID) {
      return {
        ...state,
        todos: state.todos.map(todo => (
          todo.id === id ? { ...todo, complete: !todo.complete } : todo
        ))
      }
    }
  }
)

let nextId = 1
function getId(): ID {
  return nextId++
}
