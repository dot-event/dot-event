/* eslint-env jest */

var dot = require("./dot")()

beforeEach(function() {
  dot.reset()
})

describe("opt", function() {
  test("last string", function() {
    var arg, opts

    dot.on("a.b", "c", function(a, o) {
      arg = a
      opts = o
    })

    return dot("a.b.c", "hi").then(function() {
      expect(arg).toBe("hi")
      expect(opts).toEqual({
        dot: dot,
        ns: "a",
        prop: "b.c",
        propArr: ["b", "c"],
      })
    })
  })

  test("first string", function() {
    var arg, opts

    dot.on(function(a, o) {
      arg = a
      opts = o
    })

    return dot("a").then(function() {
      expect(arg).toBe("a")
      expect(opts).toEqual({
        dot: dot,
        prop: "",
        propArr: [],
      })
    })
  })

  test("first non-string", function() {
    var arg, opts

    dot.on(function(a, o) {
      arg = a
      opts = o
    })

    return dot(true).then(function() {
      expect(arg).toBe(true)
      expect(opts).toEqual({
        dot: dot,
        prop: "",
        propArr: [],
      })
    })
  })
})
