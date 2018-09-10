import { mount, ReactWrapper } from "enzyme"
import * as React from "react"
import { App, TodoRow } from "./App"
import * as Todo from "./redux/todo"

const todos = [
  { complete: false, id: 1, title: "Take out the trash" },
  { complete: false, id: 2, title: "Walk the dog" }
]

beforeEach(() => {
  jest.restoreAllMocks()
})

it("displays todos", () => {
  const props = { ...Todo.actions, todos }
  const app = mount(<App {...props} />)
  expect(app.text()).toMatch("Take out the trash")
  expect(app.text()).toMatch("Walk the dog")
})

it("separates complete and incomplete todos", () => {
  const props = {
    ...Todo.actions,
    todos: [
      { complete: false, id: 1, title: "Take out the trash" },
      { complete: true, id: 3, title: "Make todo list" },
      { complete: false, id: 2, title: "Walk the dog" }
    ]
  }
  const app = mount(<App {...props} />)
  const incomplete = app.find(".todo-incomplete-list .todo")
  const complete = app.find(".todo-complete-list .todo")
  expect(incomplete.map(n => n.text())).toEqual([
    "Take out the trash",
    "Walk the dog"
  ])
  expect(complete.map(n => n.text())).toEqual(["Make todo list"])
})

it("displays completed todos with special styling", () => {
  const props = {
    ...Todo.actions,
    todos: [
      { complete: false, id: 1, title: "Take out the trash" },
      { complete: true, id: 3, title: "Make todo list" },
      { complete: false, id: 2, title: "Walk the dog" }
    ]
  }
  const app = mount(<App {...props} />)
  const incomplete = app.find(".todo-incomplete-list .todo")
  const complete = app.find(".todo-complete-list .todo")
  expect(incomplete.some('.complete')).toBe(false)
  expect(complete.every('.complete')).toBe(true)
})

it("adds a todo", () => {
  jest.spyOn(Todo.actions, "create")
  const props = { ...Todo.actions, todos: [] }
  const app = mount(<App {...props} />)
  const input = app.find('input[type="text"]')
  getInputElem(input).value = "new todo"
  input.closest("form").simulate("submit")
  expect(Todo.actions.create).toHaveBeenCalledWith("new todo")
})

it("toggles a todo", () => {
  jest.spyOn(Todo.actions, "toggle")
  const props = { ...Todo.actions, todos }
  const app = mount(<App {...props} />)
  const todoRow = app.find(TodoRow).filterWhere(n => n.props().todo.id === 2)
  todoRow.find("input[type='checkbox']").simulate("change")
  expect(Todo.actions.toggle).toHaveBeenCalledWith(2, expect.anything())
})

function getInputElem(node: ReactWrapper): HTMLInputElement {
  const elem = node.getDOMNode()
  return elem as HTMLInputElement
}
