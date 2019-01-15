# dot-event

Javascript event emitter, foundation of everything.

![neutron star](neutron.gif)

## Buzzwords

Dot-event produces code that is:

- Asynchronous
- Debuggable
- Decoupled
- Extensible
- Testable

## Listening to events

```js
var dot = require("dot-event")()

dot.any("someEvent", function(prop, arg, dot, event) {
  //    ^—— event             ^—— Array.<String>
})
```

- The first listener argument (`prop`) is an `Array.<String>` of prop keys.
- The second listener argument (`arg`) is any value.
- The third listener argument (`dot`) is the dot-event instance.
- The fourth listener argument (`event`) is the event `String`.

## Emitting events

```js
dot.someEvent("a.b.c", ["d", "e", "f"], { opt: true })
//  ^—— event ^—— prop ^—— prop         ^—— arg
```

- The last argument (`arg`) may be any value.
- All arguments up to the last form a dot-delimited prop identifier. Only `String` and `Array.<String>` arguments form the prop identifier.

## Existing dot composers

| Library | Description                   | URL                                 |
| ------- | ----------------------------- | ----------------------------------- |
| arg     | Run functions from CLI or web | https://github.com/dot-event/arg    |
| log     | Log functions                 | https://github.com/dot-event/log2   |
| store   | Immutable store               | https://github.com/dot-event/store2 |
