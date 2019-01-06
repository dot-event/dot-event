/*global Map Promise Set*/
/*prettier-ignore*/
"use strict";

// Helper variables
//
var after = "after",
  before = "before",
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
function callOnAny(a, m, p) {
  // a - arg
  // m - map
  // p - prop
  //
  var keys = p.match(propRegex) || [],
    props = ""

  var promise = keys.map(function(prop, i) {
    props = props + (i > 0 ? period : empty) + prop
    return callOn(a, m, props)
  })

  return Promise.all([
    callOn(a, m, ""),
    Promise.all(promise),
  ])
}

// Call "on" listener functions
//
function callOn(a, m, p) {
  // a - arg
  // m - map
  // p - props
  //
  var set = m.get(p)

  if (set) {
    var promises = []

    set.forEach(function(fn) {
      if (!a.sig.cancel) {
        promises.push(fn(a))
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
  // o - options
  // p - props
  // r - refs
  // s - state
  //
  var a1 = { sig: {} },
    a2 = { sig: {} },
    arg = {
      dot: r.dot,
      opts: o,
      prop: p,
    },
    pa = after + period + p,
    pb = before + period + p

  Object.assign(a1, arg)
  Object.assign(a2, arg)

  var promise = Promise.all([
    callOnAny(a1, s.anyMap, pb),
    callOn(a2, s.onMap, pb),
  ])
    .then(function() {
      return Promise.all([
        callOnAny(a1, s.anyMap, p),
        callOn(a2, s.onMap, p),
      ])
    })
    .then(function() {
      return Promise.all([
        callOnAny(a1, s.anyMap, pa),
        callOn(a2, s.onMap, pa),
      ])
    })
    .then(function() {
      return arg
    })

  return a1.sig.value || a2.sig.value || promise
}

// Turn off listener(s)
//
function off(fn, m, o, p, r, s) {
  // fn - listener
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
  // fn - listener
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

// Reset listener maps
//
function reset() {
  this.s.anyMap = new Map()
  this.s.onMap = new Map()
}

// Parses arguments for `emit`, `off`, `on`, and `onAny`
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
      isStr = t === strType

    fn = isFn ? opt : fn
    p = isStr ? (p ? p + period + opt : opt) : p
    o = !isFn && !isStr ? opt : o
  }

  return this.fn(fn, this.m, o, p, this.r, this.s)
}
