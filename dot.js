/*global Map Promise Set*/
/*prettier-ignore*/
"use strict";

// Helper variables
//
var after = ["after"],
  before = ["before"],
  fnType = "function",
  objType = "object",
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
function callOnAny(a, m, p, s) {
  // a - arg
  // m - map
  // p - props
  // s - signal
  //
  var props = []

  var promise = p.map(function(prop) {
    props.push(prop)
    return callOn(a, m, props, s)
  })

  return Promise.all([
    callOn(a, m, [], s),
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
  var set = m.get(p.join(period))

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
  var pa = after.concat(p),
    pb = before.concat(p),
    sig1 = {},
    sig2 = {}

  var propArr = p.slice(1)

  var arg = {
    dot: r.dot,
    opt: {
      fn: o.fn,
      obj: o.obj,
      str: o.str,
    },
    prop: {
      arr: propArr,
      ns: p[0],
      str: propArr.join("."),
    },
  }

  var promise = Promise.all([
    callOnAny(arg, s.anyMap, pb, sig1),
    callOn(arg, s.onMap, pb, sig2),
  ])
    .then(function() {
      return Promise.all([
        callOnAny(arg, s.anyMap, p, sig1),
        callOn(arg, s.onMap, p, sig2),
      ])
    })
    .then(function() {
      return Promise.all([
        callOnAny(arg, s.anyMap, pa, sig1),
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
  var prop = p.join(period),
    set = s[m].get(prop)

  if (set) {
    fn ? s[m].delete(prop) : set.delete(fn)
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

  var prop = p.join(period),
    set

  if (s[m].has(prop)) {
    set = s[m].get(prop)
  } else {
    set = new Set()
    s[m].set(prop, set)
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
    obj,
    p = [],
    str

  for (var i = 0; i < a.length; i++) {
    var opt = a[i],
      t = typeof opt

    var isFn = t === fnType,
      isObj = t === objType,
      isStr = t === strType

    if (isStr && (i == 0 || i < a.length - 1)) {
      p = p.concat(opt.split(period))
    }

    fn = isFn ? opt : fn
    obj = isObj ? opt : obj
    str = isStr ? opt : str
  }

  var o = {
    fn: fn,
    obj: obj,
    str: str,
  }

  return this.fn(fn, this.m, o, p, this.r, this.s)
}
