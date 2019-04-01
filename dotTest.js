/*global Promise*/
/* eslint-env jest */

var dot

beforeEach(function() {
  dot = require("./dot")()
})

describe("dot", function() {
  test("on empty", function() {
    var called

    dot.on(function() {
      called = true
    })

    return dot().then(function() {
      expect(called).toBe(true)
    })
  })

  test("on string props", function() {
    var called

    dot.on("a", "b.c", function() {
      called = true
    })

    return dot("a", "b", "c").then(function() {
      expect(called).toBe(true)
    })
  })

  test("on array props", function() {
    var called

    dot.on(["a"], ["b", "c"], function() {
      called = true
    })

    return dot("a", "b", "c").then(function() {
      expect(called).toBe(true)
    })
  })

  test("on args", function() {
    var args

    dot.on(["a", "b"], "c", function() {
      args = Array.prototype.slice.call(arguments)
    })

    return dot("a", "b", "c", { test: true }).then(
      function() {
        expect(args).toEqual([
          ["b", "c"],
          { test: true },
          dot,
          "a",
          {
            valuePromise: expect.any(Promise),
          },
        ])
      }
    )
  })

  test("on arg", function() {
    var arg

    dot.on(["a", "b"], "c", function(p, a, d, e, sig) {
      sig.arg = { test: true }
    })

    dot.on(["a", "b"], "c", function(p, a) {
      arg = a
    })

    return dot("a", "b", "c", { failed: true }).then(
      function() {
        expect(arg).toEqual({ test: true })
      }
    )
  })

  test("on cancel", function() {
    var called

    dot.on(["a", "b"], "c", function(p, a, d, e, sig) {
      sig.cancel = true
    })

    dot.on("a", "b", "c", function() {
      called = true
    })

    return dot("a", "b", "c").then(function() {
      expect(called).not.toBe(true)
    })
  })

  test("on value", function() {
    dot.on(["a", "b"], "c", function(p, a, d, e, sig) {
      sig.value = true
    })

    expect(dot("a", "b", "c")).toBe(true)
  })

  test("on value (from function)", function() {
    dot.on(["a", "b"], "c", function(p, a, d, e, sig) {
      sig.valueFn = function() {
        return true
      }
    })

    expect(dot("a", "b", "c")).toBe(true)
  })

  test("on value (from return)", function() {
    dot.on(["a", "b"], "c", function() {
      return true
    })

    expect(dot("a", "b", "c")).toBe(true)
  })

  test("on value (from promise)", function(done) {
    dot.on(["a", "b"], "c", function(
      prop,
      arg,
      dot,
      e,
      sig
    ) {
      return new Promise(function(resolve) {
        setTimeout(function() {
          sig.value = "hi"
          resolve()
        }, 1)
      })
    })

    dot("a", "b", "c").then(function(arg) {
      expect(arg).toBe("hi")
      done()
    })
  })

  test("onAny empty", function() {
    var called

    dot.any(function() {
      called = true
    })

    return dot("a", "b", "c").then(function() {
      expect(called).toBe(true)
    })
  })

  test("onAny props", function() {
    var called

    dot.any("a", function() {
      called = true
    })

    return dot("a", "b", "c").then(function() {
      expect(called).toBe(true)
    })
  })

  test("off", function() {
    var called

    var off = dot.on("a", "b", "c", function() {
      called = true
    })

    off()

    return dot("a", "b", "c").then(function() {
      expect(called).not.toBe(true)
    })
  })

  test("emit helper without props", function() {
    var called

    dot.any("a", function() {
      called = true
    })

    return dot.a().then(function() {
      expect(called).toBe(true)
    })
  })
})
