import classNames from "classnames"
import * as React from "react"
import * as ReactRedux from "react-redux"
import * as Redux from "redux"
import "./App.css"
import * as Todo from "./redux/todo"

// Props for this component are a union of the outputs of the `mapStateToProps`
// and `mapDispatchToProps` arguments to in the `connect` call below. The
// dispatchers that are created by `Redux.bindActionCreators` have the same type
// as the action creators in `Todo.actions`, so include `typeof Todo.actions` in
// the `Props` type to get accurate type checking when calling dispatchers.
type Props = typeof Todo.actions & {
  todos: Todo.Todo[]
}

export function App(props: Props) {
  const titleRef = React.createRef<HTMLInputElement>()
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const input = titleRef.current
    if (input) {
      props.create(input.value)
      input.value = ""
    }
  }
  // const todos = R.sortBy(todo => todo.complete, props.todos)
  const incomplete = props.todos.filter(todo => !todo.complete)
  const complete = props.todos.filter(todo => todo.complete)
  return (
    <section className="main">
      <form onSubmit={onSubmit}>
        <input
          type="text"
          ref={titleRef}
          name="todoTitle"
          placeholder="What to do?"
        />
        <button type="submit">Create Todo</button>
      </form>
      <div className="todo-lists">
        <TodoList
          className="todo-incomplete-list"
          title="Todo"
          todos={incomplete}
          toggle={props.toggle}
        />
        {complete.length >= 1 ? (
          <React.Fragment>
            <div className="vert-separator" />
            <TodoList
              className="todo-complete-list"
              title="Done"
              todos={complete}
              toggle={props.toggle}
            />
          </React.Fragment>
        ) : null}
      </div>
    </section>
  )
}

export function TodoList({
  className,
  title,
  todos,
  toggle
}: {
  className?: string
  title: string
  todos: Todo.Todo[]
  toggle: (id: number) => void
}) {
  return (
    <div className={classNames("todo-list", className)}>
      <header>
        <h2>{title}</h2>
      </header>
      <div className="todo-list-items">
        {todos.map(todo => (
          <TodoRow
            key={todo.id}
            toggle={toggle.bind(null, todo.id)}
            todo={todo}
          />
        ))}
      </div>
    </div>
  )
}

export function TodoRow({
  todo,
  toggle
}: {
  todo: Todo.Todo
  toggle: () => void
}) {
  return (
    <label className={classNames("todo", { complete: todo.complete })}>
      <input type="checkbox" checked={todo.complete} onChange={toggle} />
      <span>{todo.title}</span>
    </label>
  )
}

const ConnectedApp = ReactRedux.connect(
  (state: Todo.State) => ({ todos: state.todos }), // map state to props
  dispatch => Redux.bindActionCreators(Todo.actions, dispatch)
)(App)

export default ConnectedApp
