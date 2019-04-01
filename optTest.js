/* global Promise */
/* eslint-env jest */

var dot

beforeEach(function() {
  dot = require("./dot")()
})

describe("opt", function() {
  test("last string", function() {
    var args

    dot.on("a", "b", "c", function() {
      args = Array.prototype.slice.call(arguments)
    })

    return dot("a", "b", "c").then(function() {
      expect(args).toEqual([
        ["b", "c"],
        undefined,
        dot,
        "a",
        {
          valuePromise: expect.any(Promise),
        },
      ])
    })
  })

  test("first string", function() {
    var args

    dot.on("a", function() {
      args = Array.prototype.slice.call(arguments)
    })

    return dot("a").then(function() {
      expect(args).toEqual([
        [],
        undefined,
        dot,
        "a",
        {
          valuePromise: expect.any(Promise),
        },
      ])
    })
  })

  test("first non-string", function() {
    var args

    dot.on(function() {
      args = Array.prototype.slice.call(arguments)
    })

    return dot(true).then(function() {
      expect(args).toEqual([
        [],
        true,
        dot,
        undefined,
        {
          valuePromise: expect.any(Promise),
        },
      ])
    })
  })
})
