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
    })
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
