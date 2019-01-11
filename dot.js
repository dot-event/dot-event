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
function callAny(a, k, m, s) {
  // a - arg
  // k - key
  // m - map
  // s - signal
  //
  var key = []

  var promise = k.map(function(prop) {
    key.push(prop)
    return callOn(a, key, m, s)
  })

  return Promise.all([
    callOn(a, undefined, m, s),
    Promise.all(promise),
  ])
}

// Call "on" listener functions
//
function callOn(a, k, m, s) {
  // a - arg
  // k - key
  // m - map
  // s - signal
  //
  var set = m.get(k ? k.join(period) : empty)

  if (set) {
    var promises = []

    set.forEach(function(fn) {
      if (!s.cancel) {
        promises.push(fn(a, s))
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
function emit(k, m, o, p, r) {
  // k - key
  // o - opts
  // p - props
  // r - refs
  //
  var arg = {
      dot: r.dot,
      ns: p.ns,
      opt: o,
      prop: p.str,
      propArr: p.arr,
    },
    s = r.dot.state,
    sig1 = {},
    sig2 = {}

  // console.log(arg)

  var promise = Promise.all([
    callAny(arg, k.arr, s.beforeAny, sig1),
    callOn(arg, k.arr, s.beforeOn, sig2),
  ])
    .then(function() {
      return Promise.all([
        callAny(arg, k.arr, s.any, sig1),
        callOn(arg, k.arr, s.on, sig2),
      ])
    })
    .then(function() {
      return Promise.all([
        callAny(arg, k.arr, s.afterAny, sig1),
        callOn(arg, k.arr, s.afterOn, sig2),
      ])
    })
    .then(function() {
      return arg
    })

  var value = sig1.value || sig2.value

  var noValue =
    sig1.value === undefined && sig2.value === undefined

  return noValue ? promise : value
}

// Turn off listener(s)
//
function off(k, m, o, p, r) {
  // k - key
  // m - map
  // o - opts
  // r - refs
  //
  var s = r.dot.state,
    set = s[m].get(k.str)

  if (set) {
    o ? s[m].delete(k.str) : set.delete(o)
  }
}

// Base listener adding logic
//
function on(k, m, o, p, r) {
  // k - key
  // m - map
  // o - opts
  // p - props
  // r - refs
  //
  if (!o) {
    return
  }

  var s = r.dot.state,
    set

  if (s[m].has(k.str)) {
    set = s[m].get(k.str)
  } else {
    set = new Set()
    s[m].set(k.str, set)

    r.dot[p.ns] =
      r.dot[p.ns] ||
      nsEmit.bind({
        fn: emit,
        p: p,
        r: r,
        s: s,
      })
  }

  set.add(o)

  return off.bind(null, k, m, o, p, r)
}

function nsEmit() {
  var a = Array.prototype.slice.call(arguments)

  if (typeof a[0] === "string") {
    a[0] = this.p.ns + period + a[0]
  } else if (Array.isArray(a[0])) {
    a[0][0] = this.p.ns + period + a[0][0]
  } else {
    a.unshift(this.p.ns)
  }

  if (a.length === 1) {
    a.push(undefined)
  }

  return setup.apply(this, a)
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
    on: new Map(),
  }
}

// Parse arguments for `emit`, `off`, `on`, and `onAny`
//
function setup() {
  var a = arguments,
    k = { arr: [] },
    o,
    p = {}

  for (var i = 0; i < a.length; i++) {
    if (i === a.length - 1) {
      o = a[i]
    } else {
      k.arr = k.arr.concat(
        typeof a[i] === strType ? a[i].split(period) : a[i]
      )
    }
  }

  k.str = k.arr.join(period)
  p.arr = k.arr.slice(1)
  p.ns = k.arr[0]
  p.str = p.arr.join(period)

  // console.log(k, o, p)

  return this.fn(k, this.m, o, p, this.r)
}
