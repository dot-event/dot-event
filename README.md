# dot-event

Javascript event emitter, foundation of everything.

![neutron star](neutron.gif)

## Purpose

Dot-event provides a succinct interface for calling events and persisting state with a tiny footprint (<1kb).

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

**Event id tip:** The first string or element in an array of strings passed to `dot.on` or `dot.any` is considered the event id.

## Event id & props

```js
dot.on("a", "b", "c", prop => prop)
dot("a", "b", "c") // ["b", "c"]
```

**Prop tip 1:** Any string or array of strings passed to `dot` after the event id are considered prop identifiers.

**Prop tip 2:** The first argument to the listener function is always a prop array.

## Emit argument

```js
dot.on((prop, arg) => arg)
dot({ a: "b" }) // { a: "b" }
```

**Arg tip 1:** The last non-prop emit argument is considered the user-provided argument.

**Arg tip 2:** The second argument to the listener is always the user-provided argument.

## Any

```js
dot.any(() => "!!!")
dot("a", "b", "c") // "!!!"
```

## Helper function

```js
dot.any("a", props => props)
dot.a("b", "c") // [ "b", "c" ]
```

**Helper function tip:** If `dot.any` receives only an event id and no props, dot-event creates an emitter helper function like `dot.a()`.

## Listener arguments

No matter what is passed to the `dot` function, listeners always receive five arguments:

- `prop` — an array of string identifiers
- `arg` — a user-provided argument
- `dot` - the dot-event instance
- `event` — the event id
- `signal` — dot-event signal object (use `signal.cancel = true` for event cancellation)

## Existing dot composers

| Library | Description                    | URL                                 |
| ------- | ------------------------------ | ----------------------------------- |
| ads     | Google Publisher Tag functions | https://github.com/dot-event/ads    |
| arg     | CLI and URL argument handling  | https://github.com/dot-event/arg    |
| fetch   | Universal HTTP fetch function  | https://github.com/dot-event/fetch  |
| log     | Log functions                  | https://github.com/dot-event/log2   |
| store   | Immutable store                | https://github.com/dot-event/store2 |
