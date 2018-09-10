import * as Redux from "redux"

// Extend Redux' base `Action` interface to require a `payload` property
export interface ActionWithPayload<P, T = any> extends Redux.Action<T> {
  payload: P
}

// A handler is like a reducer except that it is specific to one action type,
// and receives the action payload as its argument.
export type Handler<S, P> = (state: S, payload: P) => S

type HandlerMap<S> = Record<string, Handler<S, any>>

// `Payload<H>` infers the payload type required by handler `H`. If the handler
// does not take a payload argument then the type of `Payload<H>` is `undefined`.
type Payload<H> = H extends (s: any) => any
  ? undefined // `undefined` if handler does not take payload argument
  : H extends Handler<any, infer Payload> ? Payload : never // produce an error if `H` is not a `Handler`

// `ActionCreators<HM>` computes a type for an action creator map based on the
// handler map `HM`.
type ActionCreators<HM extends HandlerMap<any>> = {
  [K in keyof HM]: Payload<HM[K]> extends undefined
    ? () => ActionWithPayload<undefined> // zero arguments if payload type is `undefined`
    : (payload: Payload<HM[K]>) => ActionWithPayload<Payload<HM[K]>>
}

type ActionTypes<HM extends HandlerMap<any>> = { [K in keyof HM]: string }

// `combineHandlers` calls two other functions to compute an action creator map,
// and a reducer. Actions produced by generated action creators have a `type`
// property based on the map key of the handler / action creator. But short
// handler names might not be unique in the application. So each `type` property
// is prefixed with the given `prefix`, which should be unique to this module.
export function combineHandlers<State, HM extends HandlerMap<State>>(
  nameSpace: string,
  getInitialState: () => State,
  handlers: HM
): {
  actions: ActionCreators<HM>
  actionTypes: ActionTypes<HM>
  reducer: Redux.Reducer<State>
} {
  return {
    actions: extractActionCreators(nameSpace, handlers),
    actionTypes: extractActionTypes(nameSpace, handlers),
    reducer: extractReducer(nameSpace, getInitialState, handlers)
  }
}

function extractActionCreators<HM extends HandlerMap<any>>(
  nameSpace: string,
  handlers: HM
): ActionCreators<HM> {
  const actionCreators: any = {}
  for (const k of Object.keys(handlers)) {
    const type = applyPrefix(nameSpace, k)
    actionCreators[k] = (payload: any) => ({ payload, type })
  }
  return actionCreators
}

function extractActionTypes<HM extends HandlerMap<any>>(
  nameSpace: string,
  handlers: HM
): ActionTypes<HM> {
  const actionTypes: any = {}
  for (const k of Object.keys(handlers)) {
    actionTypes[k] = applyPrefix(nameSpace, k)
  }
  return actionTypes
}

function extractReducer<S, HM extends HandlerMap<S>>(
  nameSpace: string,
  getInitialState: () => S,
  handlers: HM
): Redux.Reducer<S> {
  return (state = getInitialState(), action) => {
    const type = removePrefix(nameSpace, action.type)
    const handler = handlers[type]
    if (handler) {
      return handler(state, action.payload)
    }
    return state
  }
}

function applyPrefix(nameSpace: string, key: string): string {
  return nameSpace + "/" + key
}

function removePrefix(nameSpace: string, key: string): string {
  return key.slice(nameSpace.length + 1)
}
