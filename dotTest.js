/* eslint-env jest */

var dot = require("./dot")()

beforeEach(function() {
  dot.reset()
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

    return dot("a.b.c").then(function() {
      expect(called).toBe(true)
    })
  })

  test("on array props", function() {
    var called

    dot.on(["a"], ["b", "c"], function() {
      called = true
    })

    return dot("a.b.c").then(function() {
      expect(called).toBe(true)
    })
  })

  test("on args", function() {
    var args

    dot.on("a.b", "c", function(a) {
      args = a
    })

    return dot("a.b.c", { test: true }).then(function() {
      expect(args).toEqual({
        dot: dot,
        ns: "a",
        opt: { test: true },
        prop: "b.c",
        propArr: ["b", "c"],
      })
    })
  })

  test("on before/after", function() {
    var order = []

    dot.afterOn("a", "b", "c", function() {
      order.push(3)
    })

    dot.on("a", "b", "c", function() {
      order.push(2)
    })

    dot.beforeOn("a.b", "c", function() {
      order.push(1)
    })

    return dot("a.b.c").then(function() {
      expect(order).toEqual([1, 2, 3])
    })
  })

  test("on cancel", function() {
    var called

    dot.beforeOn("a.b", "c", function(opt, sig) {
      sig.cancel = true
    })

    dot.on("a", "b", "c", function() {
      called = true
    })

    return dot("a.b.c").then(function() {
      expect(called).not.toBe(true)
    })
  })

  test("on value", function() {
    dot.beforeOn("a.b", "c", function(opt, sig) {
      sig.value = true
    })

    expect(dot("a.b.c")).toBe(true)
  })

  test("onAny empty", function() {
    var called

    dot.any(function() {
      called = true
    })

    return dot("a.b.c").then(function() {
      expect(called).toBe(true)
    })
  })

  test("onAny props", function() {
    var called

    dot.any("a", function() {
      called = true
    })

    return dot("a.b.c").then(function() {
      expect(called).toBe(true)
    })
  })

  test("onAny before/after", function() {
    var order = []

    dot.afterAny("a.b", function() {
      order.push(3)
    })

    dot.any("a", function() {
      order.push(2)
    })

    dot.beforeAny("a", function() {
      order.push(1)
    })

    return dot("a.b.c").then(function() {
      expect(order).toEqual([1, 2, 3])
    })
  })

  test("off", function() {
    var called

    var off = dot.on("a", "b", "c", function() {
      called = true
    })

    off()

    return dot("a.b.c").then(function() {
      expect(called).not.toBe(true)
    })
  })

  test("emit helper", function() {
    var called

    dot.on("a.b.c", function() {
      called = true
    })

    return dot.a("b.c").then(function() {
      expect(called).toBe(true)
    })
  })

  test("emit helper without props", function() {
    var called

    dot.on("a", function() {
      called = true
    })

    return dot.a().then(function() {
      expect(called).toBe(true)
    })
  })
})
