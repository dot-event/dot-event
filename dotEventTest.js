/* eslint-env jest */

var dot = require("./dotEvent")

test("on", function() {
  var called

  dot.on("emit.a", "b", "c", function() {
    called = true
  })

  return dot("emit.a.b.c").then(function() {
    expect(called).toBe(true)
  })
})

test("on args", function() {
  var args

  dot.on("emit.a", "b", "c", function(a) {
    args = a
  })

  return dot("emit.a.b.c", { test: true }).then(function() {
    expect(args).toEqual({
      dot: dot,
      op: "emit",
      opts: { test: true },
      prop: "a.b.c",
      sig: {},
    })
  })
})

test("on before/after", function() {
  var order = []

  dot.on("afterEmit.a", "b", "c", function() {
    order.push(3)
  })

  dot.on("emit.a", "b", "c", function() {
    order.push(2)
  })

  dot.on("beforeEmit.a", "b", "c", function() {
    order.push(1)
  })

  return dot("emit.a.b.c").then(function() {
    expect(order).toEqual([1, 2, 3])
  })
})

test("on before cancel", function() {
  var called

  dot.on("beforeEmit.a", "b", "c", function(options) {
    options.sig.cancel = true
  })

  dot.on("emit.a", "b", "c", function() {
    called = true
  })

  return dot("emit.a.b.c").then(function() {
    expect(called).not.toBe(true)
  })
})

test("off", function() {
  var called

  var off = dot.on("emit.a", "b", "c", function() {
    called = true
  })

  off()

  return dot("emit.a.b.c").then(function() {
    expect(called).not.toBe(true)
  })
})
