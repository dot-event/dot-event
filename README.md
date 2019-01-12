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

## Story

One day, a `dot` instance was born:

```js
dot = require("dot-event")()
```

Each time `dot` went into a composer, the composer added some functionality to it:

```js
module.exports = function(dot) {
  dot.any("sayHi", function() {
    console.log("hi!")
  })
}
```

The user had an easy time composing their `dot`:

```js
require("./hi")(dot)
require("./whatsUp")(dot)
require("./yo")(dot)

dot.sayHi()
```

Far away, a library author noticed the first argument behaves as expected...

```js
dot.any("say", function(arg) {
  console.log("arg:", arg)
})

dot.say("yo") // arg: yo
```

But the second argument does not!

```js
dot.any("say", function(arg, opts) {
  console.log("arg:", arg)
  console.log("opts:", opts)
})

dot.say("yo", "hello")
// arg: hello
// opts: { dot: <DotEvent>, ns: "say", prop: "yo", propArr: ["yo"] }
```

And adding even more arguments only added more props!

```js
dot.say("sup", "yo", "hello")
// arg: hello
// opts: { dot: <DotEvent>, ns: "say", prop: "sup.yo", propArr: ["sup", "yo"] }
```

And thus their journey began...

## Emitting events

```js
dot.someEvent("a.b.c", ["d", "e", "f"], { opt: true })
//  ^—— event ^—— prop ^—— prop         ^—— arg
```

- The last argument (`arg`) may be of any type the event requires.
- All arguments before the last are props. If a prop is not a `String` or `Array.<String>`, it is not included.

## Listening to events

```js
dot.any("someEvent", function(arg, opts) {
  //    ^—— event             ^——  ^—— { dot, event, prop, propArr }
})
```

- The first listener argument (`arg`) may be of any type the event requires.
- The second argument is an object containing: the dot-event instance, an event name `String`, a prop `String`, and a prop `Array.<String>`.

## Existing dot composers

| Library | Description                   | URL                                 |
| ------- | ----------------------------- | ----------------------------------- |
| arg     | Run functions from CLI or web | https://github.com/dot-event/arg    |
| log     | Log functions                 | https://github.com/dot-event/log2   |
| store   | Immutable store               | https://github.com/dot-event/store2 |
