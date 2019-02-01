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
  dot.off = setup.bind({ fn: off, r: r })
  dot.reset = reset.bind({ r: r })
  dot.reset()

  Object.keys(dot.state).forEach(function(m) {
    dot[m] = setup.bind({ fn: on, m: m, r: r })
  })

  return dot
}

// Call "onAny" listener functions
//
function callAny(a, k, m, p, r, s) {
  // a - arg
  // k - key
  // m - map
  // p - prop
  // r - refs
  // s - signal
  //
  var key

  var promise = k.arr.map(function(prop) {
    key = key ? key + period + prop : prop
    return callOn(a, key, m, p, r, s)
  })

  return Promise.all([
    callOn(a, undefined, m, p, r, s),
    Promise.all(promise),
  ])
}

// Call "on" listener functions
//
function callOn(a, k, m, p, r, s) {
  // a - arg
  // k - key
  // m - map
  // p - prop
  // r - refs
  // s - signal
  //
  var set = m.get(
    k ? (k.str !== undefined ? k.str : k) : empty
  )

  if (set) {
    var promises = []

    set.forEach(function(fn) {
      if (!s.cancel) {
        var out = fn(p.arr, a, r.dot, p.event, s)
        if (out && out.then) {
          promises.push(out)
        } else if (out !== undefined) {
          s.value = s.value || out
        }
      }
    })

    return Promise.all(promises).then(function() {
      return a
    })
  } else {
    return Promise.resolve(a)
  }
}

// Call "on" and "onAny" listener functions
//
function emit(a, k, m, p, r) {
  // a - arg
  // k - key
  // p - props
  // r - refs
  //
  var s = r.dot.state,
    sig = {}

  var promise = Promise.all([
    callAny(a, k, s.beforeAny, p, r, sig),
    callOn(a, k, s.beforeOn, p, r, sig),
  ])
    .then(function() {
      return Promise.all([
        callAny(a, k, s.any, p, r, sig),
        callOn(a, k, s.on, p, r, sig),
      ])
    })
    .then(function() {
      return Promise.all([
        callAny(a, k, s.afterAny, p, r, sig),
        callOn(a, k, s.afterOn, p, r, sig),
      ])
    })
    .then(function() {
      s.events.delete(promise)
      return sig.value === undefined ? a : sig.value
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

    if (p.event) {
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
    afterAny: new Map(),
    afterOn: new Map(),
    any: new Map(),
    beforeAny: new Map(),
    beforeOn: new Map(),
    events: new Set(),
    on: new Map(),
  }
}

// Parse arguments for `emit`, `off`, `on`, and `onAny`
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
