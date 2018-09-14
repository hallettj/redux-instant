import { combineHandlers } from "./index"

type State = { count: number, title: string }

const initState: State = { count: 0, title: "Counter" }

const { actions, actionTypes, reducer } = combineHandlers(
  "TestCounter",
  () => initState,
  {
    increment(state: State, payload: { delta: number }) {
      return { ...state, count: state.count + payload.delta }
    },
    reset(state: State) {
      return { ...state, count: 0 }
    },
    title(state: State, title: string) {
      return { ...state, title }
    }
  }
)

it("produces action creators", () => {
  expect(actions.increment({ delta: 2 })).toEqual({
    type: "TestCounter/increment",
    payload: { delta: 2 }
  })
  expect(actions.reset()).toEqual({ type: "TestCounter/reset" })
  expect(actions.title("New Title")).toEqual({
    type: "TestCounter/title",
    payload: "New Title"
  })
})

it("produces a map of `type` constants for each action type", () => {
  expect(actionTypes.increment).toBe("TestCounter/increment")
  expect(actionTypes.reset).toBe("TestCounter/reset")
  expect(actionTypes.title).toBe("TestCounter/title")
})

it("produces a reducer that handles each action", () => {
  expect(reducer(initState, actions.increment({ delta: 2 }))).toEqual({
    count: 2,
    title: initState.title
  })
  expect(reducer({ count: 5, title: "T" }, actions.reset())).toEqual({
    count: 0,
    title: "T"
  })
  expect(reducer({ count: 5, title: "T" }, actions.title("Count Me"))).toEqual({
    count: 5,
    title: "Count Me"
  })
})

it("ignores actions with a type that does not match the given prefix", () => {
  const otherActionType = "11chrprefix/increment"
  expect(otherActionType.length).toBe(actionTypes.increment.length)
  const state = reducer(initState, {
    type: otherActionType,
    payload: { delta: 1 }
  })
  expect(state.count).toBe(0)
})
