/*global Map Promise Set*/
/*prettier-ignore*/
"use strict";

// Helper variables
//
var after = ["after"],
  before = ["before"],
  empty = "",
  fnType = "function",
  period = ".",
  strType = "string"

// `dot` instance factory
//
module.exports = function dot() {
  var dot,
    r = {},
    s = {
      anyMap: new Map(),
      onMap: new Map(),
    }

  dot = r.dot = setup.bind({ fn: emit, r: r, s: s })
  dot.off = setup.bind({ fn: off, s: s })
  dot.on = setup.bind({ fn: on, m: "onMap", s: s })
  dot.onAny = setup.bind({ fn: on, m: "anyMap", s: s })
  dot.reset = reset.bind({ s: s })
  dot.state = s

  return dot
}

// Call "onAny" listener functions
//
function callOnAny(a, k, m, s) {
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
function emit(k, m, o, p, r, s) {
  // k - key
  // o - opts
  // p - props
  // r - refs
  // s - state
  //
  var arg = {
      dot: r.dot,
      ns: p.ns,
      opt: o.opt,
      prop: p.str,
      propArr: p.arr,
    },
    ka = after.concat(k.arr),
    kb = before.concat(k.arr),
    sig1 = {},
    sig2 = {}

  var promise = Promise.all([
    callOnAny(arg, kb, s.anyMap, sig1),
    callOn(arg, kb, s.onMap, sig2),
  ])
    .then(function() {
      return Promise.all([
        callOnAny(arg, k.arr, s.anyMap, sig1),
        callOn(arg, k.arr, s.onMap, sig2),
      ])
    })
    .then(function() {
      return Promise.all([
        callOnAny(arg, ka, s.anyMap, sig1),
        callOn(arg, ka, s.onMap, sig2),
      ])
    })
    .then(arg)

  var value = sig1.value || sig2.value

  var noValue =
    sig1.value === undefined && sig2.value === undefined

  return noValue ? promise : value
}

// Turn off listener(s)
//
function off(k, m, o, p, r, s) {
  // k - key
  // m - map
  // o - opts
  // s - state
  //
  var set = s[m].get(k.str)

  if (set) {
    o.fn ? s[m].delete(k.str) : set.delete(o.fn)
  }
}

// Base listener adding logic
//
function on(k, m, o, p, r, s) {
  // k - key
  // m - map
  // o - opts
  // p - props
  // r - refs
  // s - state
  //
  if (!o.fn) {
    return
  }

  var set

  if (s[m].has(k.str)) {
    set = s[m].get(k.str)
  } else {
    set = new Set()
    s[m].set(k.str, set)
  }

  set.add(o.fn)

  return off.bind(null, k, m, o, p, r, s)
}

// Reset state
//
function reset() {
  this.s.anyMap = new Map()
  this.s.onMap = new Map()

  for (var k in this.s) {
    if (!(this.s[k] instanceof Map)) {
      this.s[k] = undefined
    }
  }
}

// Parse arguments for `emit`, `off`, `on`, and `onAny`
//
function setup() {
  var a = arguments,
    k = { arr: [] },
    o = {},
    p = {}

  for (var i = 0; i < a.length; i++) {
    var opt = a[i],
      t = typeof opt

    var isFirst = i === 0,
      isFn = t === fnType,
      isLast = i === a.length - 1,
      isStr = t === strType

    if (isStr && (isFirst || !isLast)) {
      k.arr = k.arr.concat(opt.split(period))
    }

    if (!isFirst || (isFirst && !isStr)) {
      o.opt = opt ? opt : o.opt
    }

    o.fn = isFn ? opt : o.fn
  }

  k.str = k.arr.join(period)

  p.arr = k.arr.slice(1)
  p.ns = k.arr[0]
  p.str = p.arr.join(period)

  return this.fn(k, this.m, o, p, this.r, this.s)
}
