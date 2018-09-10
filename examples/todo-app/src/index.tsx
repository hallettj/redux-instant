import * as React from "react"
import * as ReactDOM from "react-dom"
import * as ReactRedux from "react-redux"
import * as Redux from "redux"
import App from "./App"
import "./index.css"
import * as Todo from "./redux/todo"

const store = Redux.createStore(Todo.reducer)

ReactDOM.render(
  <ReactRedux.Provider store={store}>
    <App />
  </ReactRedux.Provider>,
  document.getElementById("root") as HTMLElement
)
