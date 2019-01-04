/*global Map Promise Set*/

var af = "after",
  be = "before",
  dot = setup.bind(emit),
  em = "",
  fnt = "function",
  m = new Map(),
  ma = new Map(),
  ot = "object",
  pe = ".",
  pr = /[^.]+/g,
  st = "string"

dot.off = setup.bind(off)
dot.on = setup.bind(on)
dot.onAny = setup.bind(onAny)
dot.reset = reset

module.exports = dot

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
  var me = "",
    mt = p.match(pr) || []

  var ps = mt.map(function(v, i) {
    me = me + (i > 0 ? pe : em) + v
    return call(ma, me, da)
  })

  return Promise.all([call(ma, "", da), Promise.all(ps)])
}

function emit(p, fn, opts) {
  var a = af + pe + p,
    b = be + pe + p,
    d = {
      dot: dot,
      opts: opts,
      prop: p,
      sig: {},
    },
    da = { sig: {} }

  for (var k in d) {
    da[k] = da[k] || d[k]
  }

  var pr = Promise.all([cAll(b, da), call(m, b, d)])
    .then(function() {
      return Promise.all([cAll(p, da), call(m, p, d)])
    })
    .then(function() {
      return Promise.all([cAll(a, da), call(m, a, d)])
    })

  return d.sig.value || da.sig.value || pr
}

function off(p, fn) {
  var s = m.get(p)

  if (s) {
    s.delete(fn)
  }
}

function onBase(m, p, fn) {
  if (!fn) {
    return
  }

  var s

  if (m.has(p)) {
    s = m.get(p)
  } else {
    s = new Set()
    m.set(p, s)
  }

  s.add(fn)

  return off.bind(null, p, fn)
}

function on(p, fn) {
  return onBase(m, p, fn)
}

function onAny(p, fn) {
  return onBase(ma, p, fn)
}

function reset() {
  m = new Map()
  ma = new Map()
}

function setup() {
  var a = arguments,
    fn,
    opts,
    p = em

  for (var i = 0; i < a.length; i++) {
    var opt = a[i],
      t = typeof opt

    fn = t === fnt ? opt : fn
    p = t === st ? (p ? p + pe + opt : opt) : p
    opts = t === ot && opt ? opt : opts
  }

  return this(p, fn, opts)
}
