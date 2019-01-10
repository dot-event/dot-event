# dot-event

An event API enabling the new library ecosystem.

![neutron star](https://media3.giphy.com/media/l3dj5M4YLaFww31V6/giphy.gif)

## Basics

Dot-event provides an interface for defining and calling functions:

```js
dot = require("dot-event")()
dot.any("mylib", function() {})
dot.mylib() // calls function
```

If you were to export `dot`, it would appear no different from any other library interface. However, this is no normal library interface.

## Extensibile

Dot-event functions are highly extensible. This is how easy it is to add logging for all your functions:

```js
require("@dot-event/log")(dot)
dot.mylib(true) // 2019-01-10T21:48:53.430Z ℹ️ mylib true
```

Other libraries can take advantage of functions like `beforeAny` and `afterAny` to add logic to any function:

```js
dot.beforeAny("mylib", function() {})
dot.afterAny("mylib", function() {})
```

The end user builds their own stack, so dot-event packages are often dependency-free and small. Check out some examples:

| Library | Description                   | URL                                |
| ------- | ----------------------------- | ---------------------------------- |
| arg     | Run functions from CLI or web | https://github.com/dot-event/arg   |
| log     | Log functions                 | https://github.com/dot-event/log   |
| store   | Immutable store               | https://github.com/dot-event/store |
