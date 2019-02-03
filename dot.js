/*global Map Promise Set*/
/*prettier-ignore*/
"use strict";

// Helper variables
//
var empty = "",
  period = ".",
  strType = "string"

// `dot` instance factory
//
module.exports = function dot() {
  var dot,
    r = {}

  dot = r.dot = setup.bind({ fn: emit, r: r })
  dot.add = add.bind({ r: r })
  dot.any = setup.bind({ fn: on, m: "any", r: r })
  dot.on = setup.bind({ fn: on, m: "on", r: r })
  dot.off = setup.bind({ fn: off, r: r })
  dot.reset = reset.bind({ r: r })

  dot.reset()

  return dot
}

// Emit "any" listener functions
//
function emitAny(a, k, m, p, pr, r, s) {
  // a - arg
  // k - key
  // m - map
  // p - prop
  // pr - promises
  // r - refs
  // s - signal
  //
  var key

  k.arr.forEach(function(prop) {
    key = key ? key + period + prop : prop
    emitOn(a, key, m, p, pr, r, s)
  })

  emitOn(a, undefined, m, p, pr, r, s)
}

// Emit "on" listener functions
//
function emitOn(a, k, m, p, pr, r, s) {
  // a - arg
  // k - key
  // m - map
  // p - prop
  // pr - promises
  // r - refs
  // s - signal
  //
  var set = m.get(
    k ? (k.str !== undefined ? k.str : k) : empty
  )

  if (set) {
    set.forEach(function(fn) {
      if (!s.cancel) {
        var out = fn(p.arr, a, r.dot, p.event, s)
        if (out && out.then) {
          pr.push(out)
        } else if (out !== undefined) {
          s.value = out || s.value
        }
      }
    })
  }
}

// Emit "on" and "any" listener functions
//
function emit(a, k, m, p, r) {
  // a - arg
  // k - key
  // p - props
  // r - refs
  //
  var pr = [],
    s = r.dot.state,
    sig = {}

  emitOn(a, k, s.on, p, pr, r, sig)
  emitAny(a, k, s.any, p, pr, r, sig)

  var promise = Promise.all(pr)
    .then(function(results) {
      s.events.delete(promise)
      return sig.value === undefined ? results : sig.value
    })
    .catch(function(err) {
      s.events.delete(promise)
      throw err
    })

  s.events.add(promise)

  return sig.value === undefined ? promise : sig.value
}

// Add promise (optionally from dynamic import) to events.
//
function add(promise) {
  var dot = this.r.dot,
    s = dot.state

  if (promise.then) {
    promise = promise.then(function(lib) {
      return lib && lib.default
        ? (lib.default.default || lib.default)(dot)
        : lib
    })

    s.events.add(promise)

    promise.then(function() {
      s.events.delete(promise)
    })
  }

  return promise
}

// Turn off listener(s)
//
function off(a, k, m, p, r) {
  // a - arg
  // k - key
  // m - map
  // r - refs
  //
  var s = r.dot.state,
    set = s[m].get(k.str)

  if (set) {
    a ? s[m].delete(k.str) : set.delete(a)
  }
}

// Base listener adding logic
//
function on(a, k, m, p, r) {
  // a - arg
  // k - key
  // m - map
  // p - props
  // r - refs
  //
  if (!a) {
    return
  }

  var s = r.dot.state,
    set

  if (s[m].has(k.str)) {
    set = s[m].get(k.str)
  } else {
    set = new Set()
    s[m].set(k.str, set)

    if (m === "any" && p.event && !p.length) {
      r.dot[p.event] =
        r.dot[p.event] ||
        setup.bind({
          fn: emit,
          p: p,
          r: r,
          s: s,
        })
    }
  }

  set.add(a)

  return off.bind(null, a, k, m, p, r)
}

// Reset state
//
function reset() {
  this.r.dot.state = {
    any: new Map(),
    events: new Set(),
    on: new Map(),
  }
}

// Parse arguments for `emit`, `off`, `on`, and `any`
//
function setup() {
  var a,
    args = arguments,
    k = { arr: this.p ? [this.p.event] : [] },
    p = {}

  for (var i = 0; i < args.length; i++) {
    var arg = args[i]
    var isArr = Array.isArray(arg) && arg.every(isStrTest),
      isStr = isStrTest(arg)

    if (isArr || isStr) {
      k.arr = k.arr.concat(isStr ? [arg] : arg)
    } else if (i === args.length - 1) {
      a = arg
    }
  }

  k.str = k.arr.join(period)
  p.arr = k.arr.slice(1)
  p.event = k.arr[0]

  return this.fn(a, k, this.m, p, this.r)
}

function isStrTest(arg) {
  return typeof arg === strType
}
