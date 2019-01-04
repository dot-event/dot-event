/*global Map Promise Set*/

var af = "after",
  be = "before",
  em = "",
  fnt = "function",
  ot = "object",
  pe = ".",
  pr = /[^.]+/g,
  st = "string"

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

function call(p, d, m) {
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

function cAll(p, da, m) {
  var me = "",
    mt = p.match(pr) || []

  var ps = mt.map(function(v, i) {
    me = me + (i > 0 ? pe : em) + v
    return call(me, da, m)
  })

  return Promise.all([call("", da, m), Promise.all(ps)])
}

function emit(p, fn, opts, state) {
  var a = af + pe + p,
    b = be + pe + p,
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
    cAll(b, da, state.anyMap),
    call(b, d, state.onMap),
  ])
    .then(function() {
      return Promise.all([
        cAll(p, da, state.anyMap),
        call(p, d, state.onMap),
      ])
    })
    .then(function() {
      return Promise.all([
        cAll(a, da, state.anyMap),
        call(a, d, state.onMap),
      ])
    })

  return d.sig.value || da.sig.value || pr
}

function off(p, fn, m) {
  var s = m.get(p)

  if (s) {
    s.delete(fn)
  }
}

function onBase(p, fn, m) {
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

  return off.bind(null, p, fn, m)
}

function on(p, fn, opts, state) {
  return onBase(p, fn, state.onMap)
}

function onAny(p, fn, opts, state) {
  return onBase(p, fn, state.anyMap)
}

function reset() {
  this.state.anyMap = new Map()
  this.state.onMap = new Map()
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

  return this.fn(p, fn, opts, this.state)
}
