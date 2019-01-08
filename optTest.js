/* eslint-env jest */

var dot = require("./dot")()

beforeEach(function() {
  dot.reset()
})

describe("opt", function() {
  test("last string", function() {
    var args

    dot.on("a.b", "c", function(a) {
      args = a
    })

    return dot("a.b.c", "hi").then(function() {
      expect(args).toEqual({
        dot: dot,
        opt: "hi",
        prop: { arr: ["b", "c"], ns: "a", str: "b.c" },
      })
    })
  })

  test("first string", function() {
    var args

    dot.on("a", function(a) {
      args = a
    })

    return dot("a").then(function() {
      expect(args).toEqual({
        dot: dot,
        prop: { arr: [], ns: "a", str: "" },
      })
    })
  })

  test("first non-string", function() {
    var args

    dot.on(function(a) {
      args = a
    })

    return dot(true).then(function() {
      expect(args).toEqual({
        dot: dot,
        opt: true,
        prop: { arr: [], str: "" },
      })
    })
  })
})
