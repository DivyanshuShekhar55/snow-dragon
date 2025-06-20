# snow-dragon

The most minimal state management library you can think of when working with states in Vanilla-JS or React projects.

Call it a parody of Zustand, if you will !

### The Problem We Solve :

Most of the the time people need simple 'get' and 'set' methods for their stores. This is true for most small to even some medium-size codebases.

So here it is, a small, yet performant solution for all these projects.

```bash
npm install snow-dragon
```

> [!NOTE]
> At the time of writing this repo, I have not much plans of keeping it actively maintained. However good contributions are always welcome.

## Create a Store
You can use primitives (strings, ints and all), objects and functions. State has to be updated immutably and the `set` function 

```jsx
import { create } from "snow-dragon";

const useDragonStore = create((set) => ({
  snowballs: 7,
  snowmen: 10,
  increaseSnowballs: () => set((state) => ({ snowballs: state.snowballs + 1 })),
  removeAllSnowmen: () => set({ snowmen: 0 }),
}));
```

## Next, Bind your components

Use the created hook anywhere. Choose what states will your component listen to and it will re-render on changes to the state.

```jsx
function SnowmenCounterComponent() {
  const snowmen = useDragonStore((state) => state.snowmen)
  return <h1>I see {snowmen} snowmen here</h1>
}

function Controls() {
  const produceSnowballs = useDragonStore((state) => state.increaseSnowballs)
  return <button onClick={produceSnowballs}>one up</button>
}
```

## Fetching everything

You can, but remember that it will cause the component to update for change in any store value

```jsx
const state = useDragonStore()
```

## Overwriting state
The set function takes in a second argument `false` which stands for "replace", which replaces everything from you store and writing what you provide inside the set function.
```jsx
const useElfStore = create((set) => ({
  elfs: 16,
  sledges: 4,
  deleteEverything: () => set({gifts:21}, true), // clears the entire store, actions included, then sets gifts: 21
}))
```
Even when you pass just a primitive, it replaces the entire state object with that primitive value, effectively removing all previous state properties including any action methods that were part of the state.
```jsx
const useElfStore = create((set) => ({
  elfs: 16,
  sledges: 4,
  deleteEverything: () => set('raining'), // clears the entire store, actions included,
}))
```

## Async actions
snow-dragon is a chill creature, it doesn't care if your actions are async or synchronous.
```jsx
const useGiftStore = create((set) => ({
  giftList: {},
  fetch: async (listOfChildren) => {
    const response = await fetch(listOfChildren)
    set({ giftList: await response.json() })
  },
}))
```

## Read from state in actions
`set` allows fn-updates `set(state => result)`, but you still have access to state outside of it through `get`.

```jsx
const useFirePowerStore = create((set, get) => ({
  fireLevel: 'beginner',
  action: () => {
    const fireLevel = get().fireLevel
    ...
```
## Reading/writing state and reacting to changes outside of components

Sometimes you need to access state in a non-reactive way or act upon the store.
Not recommeded, can cause issues with React Server Components

```jsx
const useFoodStore = create(() => ({ apples: 11, carrots: 14, iceCream: 2 }))

// Getting non-reactive state
const apples = useFoodStore.getState().apples
// Listening to all changes, fires synchronously on every change
const unsub1 = useFoodStore.subscribe(console.log("changes occured"))
// Updating state, will trigger listeners
useFoodStore.setState({ apples: 12 })
// Unsubscribe listeners
unsub1()

// You can of course use the hook as you always would
function Component() {
  const apples = useFoodStore((state) => state.apples)
  ...
```

## Using dragon without React

Dragon can be imported and used without the React dependency. The only difference is that the create function does not return a hook, but the API utilities.

```jsx
import { createStore } from 'snow-dragon/vanilla'

const store = createStore((set) => ...)
const { getState, setState, subscribe, getInitialState } = store

export default store
```
