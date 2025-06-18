const storeLogic = (creationObject) => {
  // store values
  let state;
  const listeners = new Set();

  const setState = (setterEntity, shouldReplace) => {
    let newState =
      typeof setterEntity === "function" ? setterEntity(state) : setterEntity;

    // check whether passed object of newState without replace:true is not same as curr state
    // Two ways to do this, if store = {a : 9, b : 7}, set({a:9})
    // In libraries like Zustand it would fire the whole set logic
    // In others we will do a deep equality check and prevent whole logic from running

    if (!replace && typeof newState == "object" && newState !== null) {
      const hasChanges = Object.keys(newState).some(
        (key) => !Object.is(newState[key], state[key])
      );

      if (!hasChanges) return;
    }

    // apply changes
    const prevState = state;
    switch (replace) {
      case undefined:
        if (typeof newState !== "object" || newState === null) {
          state = newState;
        } else {
          state = Object.assign({}, state, newState);
        }
        break;

      case true:
        state = newState;
        break;

      case false:
        state = Object.assign({}, state, newState);
        break;

      default:
        // error config passed by user
        break;
    }
    // send change event to all the subscribed listeners
    listeners.forEach((listener) => listener(state, prevState));
  };
};
