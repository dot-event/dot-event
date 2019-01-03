/*global Map Promise Set*/

var map = new Map()
var empty = ""
var period = "."

var dot = parseArgs.bind(emit)
dot.off = parseArgs.bind(off)
dot.on = parseArgs.bind(on)

module.exports = dot

function emit(op, p, fn, opts) {
  var data = { dot: dot, op: op, opts: opts, prop: p }

  p = op + period + p

  if (map.has(p)) {
    var promises = []

    map.get(p).forEach(function(fn) {
      promises.push(fn(data))
    })

    return Promise.all(promises)
  } else {
    return Promise.resolve(data)
  }
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

function parseArgs() {
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
