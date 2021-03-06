# dot-event

Javascript event emitter, foundation of everything.

![neutron star](neutron.gif)

## What is it?

Dot-event creates interfaces for listening to and emitting events.

Dot-event listeners can be synchronous or asynchronous, accept arguments, and return values.

Dot-event has a tiny footprint (<1 kb compressed and gzipped).

### Write less code

Event listeners may emit any event [through the `dot` argument](#listener-arguments), resulting in less `require` calls and easy access to functionality across your application.

### Event id & props

Dot-event optionally uses [event id](#event-id) and [prop string(s)](#props) to add identifying context to an emit. Props pay off with [logging](https://github.com/dot-event/log#readme), [store updates](https://github.com/dot-event/store#readme), and even [dom element ids](https://github.com/dot-event/el#readme).

### Dynamic composition

Dot-event uses a [composer function pattern](#composer-pattern) to add event listeners. This pattern works very well with [dynamic imports](#dynamic-imports) to create dot-event instances with dynamic functionality.

### State

Dot-event provides basic state via the `dot.state` object. On this object we built an [immutable store](https://github.com/dot-event/store#readme) that leverages props and is only ~1 kb compressed and gzipped.

### SSR-ready

Its simple to [wait for all dot-event listeners](#wait-for-pending-events) before rendering the final version of your server side page.

## Setup

```js
const dot = require("dot-event")()
```

## Basics

```js
dot.on(() => {}) // listener
dot() // emitter
```

### Return value

```js
dot.on(() => "value")
dot() // "value"
```

### Async return value

```js
dot.on(async () => "value")
dot().then(result => /* "value" */)
```

### Event id

The event id is the first string argument to `dot.on` or `dot.any`.

```js
dot.on("myEvent", () => "value")
dot("myEvent") // "value"
```

> ℹ️ The listener function receives the event id as its [fourth argument](#listener-arguments).

## Listener arguments

No matter what is passed to the `dot` emitter, listener functions always receive five arguments:

| Argument                     | Description                 |
| ---------------------------- | --------------------------- |
| [`prop`](#props)             | Array of string identifiers |
| [`arg`](#emit-argument)      | Emit argument               |
| [`dot`](#composer-pattern)   | Dot-event instance          |
| [`event`](#event-id)         | Event id                    |
| [`signal`](#signal-argument) | Signal object               |

### Props

String arguments after the [event id](#event-id) are prop identifiers.

```js
dot.on("myEvent", "prop", prop => prop)
dot("myEvent", "prop") // [ "prop" ]
```

> ℹ️ The listener function receives the prop array as its [first argument](#listener-arguments).

### Emit argument

The last non-prop argument becomes the emit argument (`arg`).

```js
dot.on((prop, arg) => arg)
dot({ option: true }) // { option: true }
```

> ℹ️ The listener function receives the emit argument as its [second argument](#listener-arguments).

### Signal argument

```js
dot.on((prop, arg, dot, eventId, signal) => {
  signal.cancel = true
  return "value"
})
dot.on(() => "never called")
dot() // "value"
```

> ℹ️ There is one other signal, `signal.value`, which you can set instead of using `return` in your listener function.

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

> ℹ️ Dot-event creates a helper function only if `dot.any` receives an event id with no props.

### Any with props

```js
dot.any("myEvent", "prop", "prop2", props => props)
dot("myEvent") // noop
dot("myEvent", "prop") // noop
dot("myEvent", "prop", "prop2") // [ "prop", "prop2" ]
dot("myEvent", "prop", "prop2", "prop3") // [ "prop", "prop2", "prop3" ]
```

## Composer pattern

A common pattern is for composers to define listeners that respond to `any` props of a particular event id.

```js
export default function(dot) {
  dot.any("myEvent", myEvent)
}

async function myEvent(prop, arg, dot) {
  prop = prop.concat(["myEvent"])
  await dot.otherEvent(prop)
}
```

> ℹ️ Another common pattern illustrated here is to append a prop id before passing them along to another emit.

## Dynamic imports

```js
dot.add(import("./myEvent"))
```

> ℹ️ You might need to run node with `--experimental-modules` to enable dynamic imports server side.

## Wait for pending events

```js
await Promise.all([...dot.state.events])
```

> ℹ️ `dot.state.events` is a [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) of promises.

## Dot composers

| Library    | Description          | URL                                            |
| ---------- | -------------------- | ---------------------------------------------- |
| ad         | Google Publisher Tag | https://github.com/dot-event/ad#readme         |
| args       | Argument definitions | https://github.com/dot-event/args#readme       |
| argv       | Parse process.argv   | https://github.com/dot-event/argv#readme       |
| controller | DOM controller       | https://github.com/dot-event/controller#readme |
| el         | DOM elements         | https://github.com/dot-event/el#readme         |
| fetch      | Universal HTTP fetch | https://github.com/dot-event/fetch#readme      |
| log        | Event logger         | https://github.com/dot-event/log#readme        |
| render     | Server side render   | https://github.com/dot-event/render#readme     |
| store      | Immutable store      | https://github.com/dot-event/store#readme      |
| view       | DOM view             | https://github.com/dot-event/view#readme       |
