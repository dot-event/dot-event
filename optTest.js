/* eslint-env jest */

var dot = require("./dot")()

beforeEach(function() {
  dot.reset()
})

describe("opt", function() {
  test("last string", function() {
    var args

    dot.on("a.b", "c", function() {
      args = Array.prototype.slice.call(arguments)
    })

    return dot("a.b.c", "hi").then(function() {
      expect(args).toEqual([["b", "c"], "hi", dot, "a", {}])
    })
  })

  test("first string", function() {
    var args

    dot.on(function() {
      args = Array.prototype.slice.call(arguments)
    })

    return dot("a").then(function() {
      expect(args).toEqual([[], "a", dot, undefined, {}])
    })
  })

  test("first non-string", function() {
    var args

    dot.on(function() {
      args = Array.prototype.slice.call(arguments)
    })

    return dot(true).then(function() {
      expect(args).toEqual([[], true, dot, undefined, {}])
    })
  })
})
