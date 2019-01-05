/*global Map Promise Set*/

// Helper variables
//
var after = "after",
  before = "before",
  empty = "",
  fnType = "function",
  objType = "object",
  period = ".",
  propRegex = /[^.]+/g,
  strType = "string"

// `dot` instance factory
//
module.exports = function dot() {
  var dot,
    state = {
      anyMap: new Map(),
      onMap: new Map(),
    }

  state.dot = dot = setup.bind({ fn: emit, state: state })
  dot.off = setup.bind({ fn: off, state: state })
  dot.on = setup.bind({ fn: on, state: state })
  dot.onAny = setup.bind({ fn: onAny, state: state })
  dot.reset = reset.bind({ state: state })

  return dot
}

// Call "onAny" listener functions
//
function callOnAny(p, d, m) {
  var combos = "",
    props = p.match(propRegex) || []

  var ps = props.map(function(prop, i) {
    combos = combos + (i > 0 ? period : empty) + prop
    return callOn(combos, d, m)
  })

  return Promise.all([callOn("", d, m), Promise.all(ps)])
}

// Call "on" listener functions
//
function callOn(p, d, m) {
  var set = m.get(p)

  if (set) {
    var promises = []

    set.forEach(function(fn) {
      if (!d.sig.cancel) {
        promises.push(fn(d))
      }
    })

    return Promise.all(promises)
  } else {
    return Promise.resolve(d)
  }
}

// Call "on" and "onAny" listener functions
//
function emit(p, fn, opts, state) {
  var a = after + period + p,
    b = before + period + p,
    d = {
      dot: state.dot,
      opts: opts,
      prop: p,
      sig: {},
    },
    da = { sig: {} }

  for (var k in d) {
    da[k] = da[k] || d[k]
  }

  var pr = Promise.all([
    callOnAny(b, da, state.anyMap),
    callOn(b, d, state.onMap),
  ])
    .then(function() {
      return Promise.all([
        callOnAny(p, da, state.anyMap),
        callOn(p, d, state.onMap),
      ])
    })
    .then(function() {
      return Promise.all([
        callOnAny(a, da, state.anyMap),
        callOn(a, d, state.onMap),
      ])
    })

  return d.sig.value || da.sig.value || pr
}

// Turn off listener(s)
//
function off(p, fn, m) {
  var set = m.get(p)

  if (set) {
    fn ? m.delete(p) : set.delete(fn)
  }
}

// Base listener adding logic
//
function onBase(p, fn, m) {
  if (!fn) {
    return
  }

  var set

  if (m.has(p)) {
    set = m.get(p)
  } else {
    set = new Set()
    m.set(p, set)
  }

  set.add(fn)

  return off.bind(null, p, fn, m)
}

// Add `on` listener
//
function on(p, fn, opts, state) {
  return onBase(p, fn, state.onMap)
}

// Add `onAny` listener
//
function onAny(p, fn, opts, state) {
  return onBase(p, fn, state.anyMap)
}

// Reset listener maps
//
function reset() {
  this.state.anyMap = new Map()
  this.state.onMap = new Map()
}

// Parses arguments for `emit`, `off`, `on`, and `onAny`
//
function setup() {
  var a = arguments,
    fn,
    opts,
    p = empty

  for (var i = 0; i < a.length; i++) {
    var opt = a[i],
      t = typeof opt

    fn = t === fnType ? opt : fn
    p = t === strType ? (p ? p + period + opt : opt) : p
    opts = t === objType && opt ? opt : opts
  }

  return this.fn(p, fn, opts, this.state)
}
