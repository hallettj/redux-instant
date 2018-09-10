# redux-instant

Minimize boilerplate in your [Redux][] app by inferring action creators and
action types from your reducer with precise type-checking when you use
Typescript.

Actions created by this library are serializable, and are compatible with
time-travel debugging.

For a working example see [examples/todo-app][example app]. Run the app with
`yarn start`.

[Redux]: https://redux.js.org/
[example app]: examples/todo-app

## Reducer and Action Creators in a single step

In a typical Redux app you define a reducer function that uses a `switch`
statement to handle specific action types. With redux instant you provide an
object with a separate _handler_ function for each action type. Each handler
takes app state and an action payload as arguments, and returns an updated
state.

```typescript
const handlers = {
  create(state: State, todo: { complete: boolean, title: string }) {
    return {
      ...state,
      todos: state.todos.concat({ ...todo, id: getId() })
    }
  },
  remove(state: State, id: number) {
    return {
      ...state,
      todos: state.todos.filter(todo => todo.id !== id)
    }
  },
  toggle(state: State, id: number) {
    return {
      ...state,
      todos: state.todos.map(
        todo =>
          todo.id === id ? { ...todo, complete: !todo.complete } : todo
      )
    }
  }
}
```

The object key for each handler is used to generate the `type` property for the
corresponding action. The keys here (`create`, `remove`, `toggle`) are short
for easy reference. To avoid name collisions with Redux actions defined in
other modules the action names are combined with a unique prefix in the next
step.

Handlers are combined to generate a single reducer function, and a set of
action creators in one step:

```typescript
import { combineHandlers } from "redux-instant"

const { actions, actionTypes, reducer } = combineHandlers(
  "TodoApp", // unique prefix to distinguish actions defined in this module
  (): State => ({ todos: [] }), // function to get initial state - make sure to include the type annotation!
  handlers
)
```

`reducer` is a normal reducer function; `actions` is a map of action creators.

## Using Action Creators

You can dispatch actions like this:

```typescript
function ShowTodo(props: { dispatch: Redux.Dispatch, todo: Todo }) {
  const { dispatch, todo } = props
  return (
    <label>
      <input
        type="checkbox"
        checked={todo.complete}
        onChange={e => dispatch(actions.toggle(todo.id))}
      />
      {todo.title}
    </label>
  )
}
```

Everything is type-checked: if you tried to call `actions.toggle()` with an
argument that is not a `number` then you will get a type error.

## Referencing Action Types

`combineHandlers` generates a unique string for each action type using the
prefix argument, and the keys in the handler map. If you want to refer to an
action type use the `actionTypes` map returned by `combineHandlers`. Using the
example above this is what you will get:

```typescript
actionTypes.create === "TodoApp/create"
actionTypes.remove === "TodoApp/remove"
actionTypes.toggle === "TodoApp/toggle"
```
