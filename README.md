# dot-event

Javascript event emitter, foundation of everything.

![neutron star](neutron.gif)

## What is it?

Dot-event creates interfaces for listening to and emitting events.

Dot-event listeners can be synchronous or asynchronous, accept arguments, and return values.

Dot-event has a tiny footprint (<1 kb compressed and gzipped).

## Write less code

Event listeners can emit any event [through the `dot` argument](#listener-arguments), resulting in less `require` calls and easy access to functionality across your application.

## Event id & props

Dot-event optionally uses an event id and prop string(s) to add unique identifying context to an emit. This "feature you didn't know you couldn't live without" pays off with logging, store updates, and more.

## Dynamic composition

Dot-event uses a [composer function pattern](#composer-pattern) to create libraries that add new event listeners. This pattern works very well with dynamic imports and also makes it very easy to dispose of and recreate dot-event instances.

## State

Dot-event provides a basic state store via the `dot.state` object. We built an [immutable store](https://github.com/dot-event/store2) on `dot.state` that leverages props and is only ~1 kb compressed and gzipped.

## Ready for SSR

Its simple to wait for all dot-event listeners to complete before rendering the final version of your server side page.

## Great logging

Composer libraries can dynamically add a listener to all events, enabling [powerful logging features](https://github.com/dot-event/log2).

## Setup

```js
const dot = require("dot-event")()
```

## Basics

```js
dot.on(() => {}) // listener
dot() // emitter
```

## Return value

```js
dot.on(() => "a")
dot() // "a"
```

## Async return value

```js
dot.on(async () => "a")
dot().then(result => /* [ "a" ] */)
```

## Event id

```js
dot.on("a", () => "b")
dot("a") // "b"
```

**Event id tip:** The first string or element in an array of strings passed to `dot.on` or `dot.any` is the event id.

## Props

```js
dot.on("a", "b", "c", prop => prop)
dot("a", "b", "c") // ["b", "c"]
```

**Prop tip 1:** Any string or array of strings passed to `dot` after the event id are prop identifiers.

**Prop tip 2:** The listener function always receives a prop array as its first argument.

## Emit argument

```js
dot.on((prop, arg) => arg)
dot({ a: "b" }) // { a: "b" }
```

**Arg tip 1:** The last non-prop emit argument is the user-provided argument.

**Arg tip 2:** The listener function always receives the user-provided argument as its second argument.

## Any

```js
dot.any(() => "!")
dot("a", "b") // "!"
```

## Any helper function

```js
dot.any("a", props => props)
dot.a("b", "c") // [ "b", "c" ]
```

**Helper tip:** Dot-event creates a helper function only if `dot.any` receives an event id with no props.

## Listener arguments

No matter what is passed to the `dot` emitter, listener functions always receive five arguments:

- `prop` — an array of string identifiers
- `arg` — a user-provided argument
- `dot` — the dot-event instance
- `event` — the event id
- `signal` — dot-event signal object (use `signal.cancel = true` for event cancellation)

## Composer pattern

```js
export default function(dot) {
  if (!dot.myEvent) {
    dot.any("myEvent", myEvent)
  }
}

async function myEvent(prop, arg, dot) {
  prop = prop.concat(["myEvent"])
  await dot.otherEvent(prop)
}
```

**Pattern tip 1:** A common pattern is for composers to define listeners that respond to `any` prop of a particular event id.

**Pattern tip 2:** Another common pattern is for listeners to append props before passing them along to another emit.

## Dot composers

| Library | Description          | URL                                 |
| ------- | -------------------- | ----------------------------------- |
| ad      | Google Publisher Tag | https://github.com/dot-event/ad     |
| arg     | CLI and URL argument | https://github.com/dot-event/arg    |
| fetch   | Universal HTTP fetch | https://github.com/dot-event/fetch  |
| log     | Event logger         | https://github.com/dot-event/log2   |
| store   | Immutable store      | https://github.com/dot-event/store2 |
