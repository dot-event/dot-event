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
  propRegex = /[^.]+/g,
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
  // k - keys
  // m - map
  // s - signal
  //
  var props = ""

  var promise = k.map(function(prop, i) {
    props = props + (i > 0 ? period : empty) + prop
    return callOn(a, m, props, s)
  })

  return Promise.all([
    callOn(a, m, "", s),
    Promise.all(promise),
  ])
}

// Call "on" listener functions
//
function callOn(a, m, p, s) {
  // a - arg
  // m - map
  // p - props
  // s - signal
  //
  var set = m.get(p)

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
function emit(fn, m, o, p, r, s) {
  // fn - function
  // o - options
  // p - props
  // r - refs
  // s - state
  //
  var keys = p.match(propRegex) || [],
    pa = after[0] + period + p,
    pb = before[0] + period + p,
    sig1 = {},
    sig2 = {}

  var props = keys.slice(1)

  var arg = Object.freeze({
    dot: r.dot,
    fn: fn,
    ns: keys[0],
    opts: o,
    prop: props.join("."),
    props: props,
  })

  var promise = Promise.all([
    callOnAny(arg, before.concat(keys), s.anyMap, sig1),
    callOn(arg, s.onMap, pb, sig2),
  ])
    .then(function() {
      return Promise.all([
        callOnAny(arg, keys, s.anyMap, sig1),
        callOn(arg, s.onMap, p, sig2),
      ])
    })
    .then(function() {
      return Promise.all([
        callOnAny(arg, after.concat(keys), s.anyMap, sig1),
        callOn(arg, s.onMap, pa, sig2),
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
function off(fn, m, o, p, r, s) {
  // fn - function
  // m - map
  // p - props
  // s - state
  //
  var set = s[m].get(p)

  if (set) {
    fn ? s[m].delete(p) : set.delete(fn)
  }
}

// Base listener adding logic
//
function on(fn, m, o, p, r, s) {
  // fn - function
  // m - map
  // p - props
  // r - refs
  // s - state
  //
  if (!fn) {
    return
  }

  var set

  if (s[m].has(p)) {
    set = s[m].get(p)
  } else {
    set = new Set()
    s[m].set(p, set)
  }

  set.add(fn)

  return off.bind(null, fn, m, o, p, r, s)
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
    fn,
    o,
    p = empty

  for (var i = 0; i < a.length; i++) {
    var opt = a[i],
      t = typeof opt

    var isFn = t === fnType,
      isLast = i === a.length - 1,
      isStr = t === strType

    var notProp = isLast && isStr && !o && i > 0

    fn = isFn ? opt : fn
    p = !notProp && isStr ? (p ? p + period + opt : opt) : p
    o = notProp || (!isFn && !isStr) ? opt : o
  }

  return this.fn(fn, this.m, o, p, this.r, this.s)
}
