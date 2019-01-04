/*global Map Promise Set*/

var af = "after",
  be = "before",
  dot = setup.bind(emit),
  em = "",
  fnt = "function",
  m = new Map(),
  ma = new Map(),
  opr = /^[^.]+/,
  ot = "object",
  pe = ".",
  pr = /[^.]+/g,
  st = "string"

dot.off = setup.bind(off)
dot.on = setup.bind(on)
dot.onAll = setup.bind(onAll)
dot.reset = reset

module.exports = dot

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function call(m, p, d) {
  var s = m.get(p)

  if (s) {
    var pr = []

    s.forEach(function(fn) {
      if (!d.sig.cancel) {
        pr.push(fn(d))
      }
    })

    return Promise.all(pr)
  } else {
    return Promise.resolve(d)
  }
}

function cAll(p, da) {
  var me = ""

  return Promise.all(
    p.match(pr).map(function(v, i) {
      me = me + (i > 0 ? pe : em) + v
      return call(ma, me, da)
    })
  )
}

function emit(op, p, fn, opts) {
  var d = {
      dot: dot,
      op: op,
      opts: opts,
      prop: p,
      sig: {},
    },
    da = { sig: {} }

  for (var k in d) {
    da[k] = da[k] || d[k]
  }

  p = op + pe + p

  var a = af + cap(p),
    b = be + cap(p)

  return cAll(b, da)
    .then(function() {
      return call(m, b, d)
    })
    .then(function() {
      return cAll(p, da)
    })
    .then(function() {
      return call(m, p, d)
    })
    .then(function() {
      return cAll(a, da)
    })
    .then(function() {
      return call(m, a, d)
    })
}

function off(op, p, fn) {
  p = op + pe + p

  var s = m.get(p)

  if (s) {
    s.delete(fn)
  }
}

function onBase(m, op, p, fn) {
  if (!fn) {
    return
  }

  var ogp = p,
    s

  p = op + pe + p

  if (m.has(p)) {
    s = m.get(p)
  } else {
    s = new Set()
    m.set(p, s)
  }

  s.add(fn)

  return off.bind(null, op, ogp, fn)
}

function on(op, p, fn) {
  return onBase(m, op, p, fn)
}

function onAll(op, p, fn) {
  return onBase(ma, op, p, fn)
}

function reset() {
  m = new Map()
  ma = new Map()
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

    fn = t === fnt ? opt : fn
    p = t === st ? p + pe + opt : p
    opts = t === ot && opt ? opt : opts
  }

  p = p.charAt(0) === pe ? p.slice(1) : p
  op = p.match(opr)[0]
  p = p.slice(op.length + 1)

  return this(op, p, fn, opts)
}
