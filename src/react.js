import { createStore } from "./vanilla.js";
import React from "react";

export const create = (creationObject) => reactStoreLogic(creationObject);

const reactStoreLogic = (creationObject) => {
  const api = createStore(creationObject);
  const useBoundStore = (selector) => useStore(api, selector);

  // return value is only the current state
  // so copy the rest of api (get, set, getInitialState, subscribe)
  // so user can do tasks like useBoundStore.set({...something...})
  Object.assign(useBoundStore, api);
  return useBoundStore;
};

// if selector is {state => state.snowballs}, then
// selector(api.getState()) returns api.getState().snowballs
// in case user passes no selector, return the complete state as default
const identity = (arg) => arg;

const useStore = (api, selector = identity) => {
  const slice = React.useSyncExternalStore(
    api.subscribe,
    () => selector(api.getState()),
    () => selector(api.getInitialState())
  );

  return slice;
};
