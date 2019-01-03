/*global Map Promise Set*/

var map = new Map()
var empty = ""
var period = "."

var dot = setup.bind(emit)
dot.off = setup.bind(off)
dot.on = setup.bind(on)

module.exports = dot

function cap(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function call(p, data) {
  var set = map.get(p)

  if (set && !data.sig.cancel) {
    var promises = []

    set.forEach(function(fn) {
      if (!data.sig.cancel) {
        promises.push(fn(data))
      }
    })

    return Promise.all(promises)
  } else {
    return Promise.resolve(data)
  }
}

function emit(op, p, fn, opts) {
  var data = {
    dot: dot,
    op: op,
    opts: opts,
    prop: p,
    sig: {},
  }

  p = op + period + p

  var b = "before" + cap(p)
  var a = "after" + cap(p)

  return call(b, data)
    .then(function() {
      return call(p, data)
    })
    .then(function() {
      return call(a, data)
    })
}

function off(op, p, fn) {
  p = op + period + p

  var set = map.get(p)

  if (set) {
    set.delete(fn)
  }
}

function on(op, p, fn) {
  if (!fn) {
    return
  }

  var ogp = p,
    set

  p = op + period + p

  if (map.has(p)) {
    set = map.get(p)
  } else {
    set = new Set()
    map.set(p, set)
  }

  set.add(fn)

  return off.bind(undefined, op, ogp, fn)
}

function setup() {
  var fn,
    op,
    opts,
    p = empty

  for (var i = 0; i < arguments.length; i++) {
    var opt = arguments[i]

    if (typeof opt === "function") {
      fn = opt
    } else if (typeof opt === "string") {
      p = p + period + opt
    } else if (typeof opt === "object" && opt) {
      opts = opt
    }
  }

  p = p.charAt(0) === period ? p.slice(1) : p
  op = p.match(/^[^.]+/)[0]
  p = p.slice(op.length + 1)

  return this(op, p, fn, opts)
}
