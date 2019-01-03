/*global Map Promise Set*/

var af = "after",
  be = "before",
  dot = setup.bind(emit),
  em = "",
  fnt = "function",
  map = new Map(),
  opr = /^[^.]+/,
  ot = "object",
  pe = ".",
  st = "string"

dot.off = setup.bind(off)
dot.on = setup.bind(on)

module.exports = dot

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function call(p, d) {
  var set = map.get(p)

  if (set && !d.sig.cancel) {
    var pr = []

    set.forEach(function(fn) {
      if (!d.sig.cancel) {
        pr.push(fn(d))
      }
    })

    return Promise.all(pr)
  } else {
    return Promise.resolve(d)
  }
}

function emit(op, p, fn, opts) {
  var d = {
    dot: dot,
    op: op,
    opts: opts,
    prop: p,
    sig: {},
  }

  p = op + pe + p

  var a = af + cap(p),
    b = be + cap(p)

  return call(b, d)
    .then(function() {
      return call(p, d)
    })
    .then(function() {
      return call(a, d)
    })
}

function off(op, p, fn) {
  p = op + pe + p

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

  p = op + pe + p

  if (map.has(p)) {
    set = map.get(p)
  } else {
    set = new Set()
    map.set(p, set)
  }

  set.add(fn)

  return off.bind(null, op, ogp, fn)
}

function setup() {
  var a = arguments,
    fn,
    op,
    opts,
    p = em

  for (var i = 0; i < a.length; i++) {
    var opt = a[i],
      t = typeof opt

    if (t === fnt) {
      fn = opt
    } else if (t === st) {
      p = p + pe + opt
    } else if (t === ot && opt) {
      opts = opt
    }
  }

  p = p.charAt(0) === pe ? p.slice(1) : p
  op = p.match(opr)[0]
  p = p.slice(op.length + 1)

  return this(op, p, fn, opts)
}
