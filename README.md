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

Dot-event optionally uses [event id](#event-id) and [prop string(s)](#props) to add identifying context to an emit. This "feature you didn't know you couldn't live without" pays off with logging, store updates, and more.

## Dynamic composition

Dot-event uses a [composer function pattern](#composer-pattern) to create libraries that add new event listeners. This pattern works very well with [dynamic imports](#dynamic-imports) to create dot-event instances with dynamic functionality.

## State

Dot-event provides basic state via the `dot.state` object. On this object we built an [immutable store](https://github.com/dot-event/store2) that leverages props and is only ~1 kb compressed and gzipped.

## SSR Ready

Its simple to [wait for all dot-event listeners](#wait-for-pending-events) before rendering the final version of your server side page.

## Great logging

Composer libraries can dynamically add a listener to all events, enabling [powerful logging features](https://github.com/dot-event/log2) out of the box.

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
dot.on(() => "value")
dot() // "value"
```

## Async return value

```js
dot.on(async () => "value")
dot().then(result => /* [ "value" ] */)
```

## Event id

```js
dot.on("myEvent", () => "value")
dot("myEvent") // "value"
```

**Event id tip:** The first string or element in an array of strings passed to `dot.on` or `dot.any` is the event id.

## Listener arguments

No matter what is passed to the `dot` emitter, listener functions always receive five arguments:

| Argument                     | Description                 |
| ---------------------------- | --------------------------- |
| [`prop`](#props)             | Array of string identifiers |
| [`arg`](#emit-argument)      | Emit argument               |
| [`dot`](#composer-pattern)   | Dot-event instance          |
| `event`                      | Event id                    |
| [`signal`](#signal-argument) | Signal object               |

## Props

```js
dot.on("myEvent", "prop", prop => prop)
dot("myEvent", "prop") // [ "prop" ]
```

**Prop tip 1:** Any string or array of strings passed to `dot` after the event id are prop identifiers (`prop`).

**Prop tip 2:** The listener function always receives a prop array as its first argument.

## Emit argument

```js
dot.on((prop, arg) => arg)
dot({ option: true }) // { option: true }
```

**Arg tip 1:** The last non-prop argument becomes the emit argument (`arg`).

**Arg tip 2:** The listener function always receives the emit argument as its second argument.

## Any

```js
dot.any(() => "!")
dot("myEvent", "prop") // "!"
```

### Any with event id

```js
dot.any("myEvent", prop => prop)
dot("myEvent", "prop") // [ "prop" ]
dot.myEvent("prop") // <-- cool helper function!
```

**Any helper tip:** Dot-event creates a helper function only if `dot.any` receives an event id with no props.

### Any with props

```js
dot.any("myEvent", "prop", "prop2", props => props)
dot("myEvent") // noop
dot("myEvent", "prop") // noop
dot("myEvent", "prop", "prop2") // [ "prop", "prop2" ]
dot("myEvent", "prop", "prop2", "prop3") // [ "prop", "prop2", "prop3" ]
```

## Composer pattern

```js
export default function(dot) {
  if (dot.myEvent) {
    return
  }
  dot.any("myEvent", myEvent)
}

async function myEvent(prop, arg, dot) {
  prop = prop.concat(["myEvent"])
  await dot.otherEvent(prop)
}
```

**Pattern tip 1:** A common pattern is for composers to define listeners that respond to `any` prop of a particular event id.

**Pattern tip 2:** Another common pattern is for listeners to append props before passing them along to another emit.

## Dynamic imports

```js
dot.add(import("./myEvent"))
```

## Wait for pending events

```js
await Promise.all([...dot.state.events])
```

## Signal argument

```js
dot.on((prop, arg, dot, eventId, signal) => {
  signal.cancel = true
  return "value"
})
dot.on(() => "never called")
dot() // "value"
```

**Signal tip:** There is one other signal, `signal.value`, which you can set instead of using `return` in your listener function.

## Dot composers

| Library | Description          | URL                                 |
| ------- | -------------------- | ----------------------------------- |
| ad      | Google Publisher Tag | https://github.com/dot-event/ad     |
| arg     | CLI and URL argument | https://github.com/dot-event/arg    |
| fetch   | Universal HTTP fetch | https://github.com/dot-event/fetch  |
| log     | Event logger         | https://github.com/dot-event/log2   |
| store   | Immutable store      | https://github.com/dot-event/store2 |
