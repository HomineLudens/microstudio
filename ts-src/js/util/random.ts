// Seeded pseudo-random number generator used by the runtime/editor.
// Loaded as a plain (non-module) script — see server/concatenator.coffee,
// which concatenates the compiled .js files (or serves them individually in
// dev mode) into a single browser script context.
//
// The original CoffeeScript (`class Random`, no `@`) compiled to a top-level
// `var Random = (function () {...})();`. Emitting a native top-level `class`
// declaration instead would be a *lexical* (let-like) binding, which cannot
// coexist with another `var Random` in the same concatenated script scope
// (see `static/js/languages/microscript/random.coffee`, an unrelated class
// with the same name that is bundled into the same `webapp_js` array in
// server/concatenator.coffee) — mixing them throws a SyntaxError at parse
// time. Wrapping the class in an IIFE assigned to `var` reproduces the
// original var-scoped, redeclaration-safe semantics.
var Random = (function () {
  class Random {
    seed: number;
    a: number;
    b: number;
    size: number;
    mask: number;
    norm: number;

    constructor(seed: number = Math.random()) {
      this.seed = seed;
      if (this.seed < 1) {
        this.seed *= 1 << 30;
      }
      this.a = 13971;
      this.b = 12345;
      this.size = 1 << 30;
      this.mask = this.size - 1;
      this.norm = 1 / this.size;
      this.nextSeed();
      this.nextSeed();
      this.nextSeed();
    }

    next(): number {
      this.seed = (this.seed * this.a + this.b) & this.mask;
      return this.seed * this.norm;
    }

    nextInt(num: number): number {
      return Math.floor(this.next() * num);
    }

    nextSeed(): number {
      return (this.seed = (this.seed * this.a + this.b) & this.mask);
    }

    setSeed(seed: number): number {
      this.seed = seed;
      if (this.seed < 1) {
        this.seed *= 1 << 30;
      }
      this.nextSeed();
      this.nextSeed();
      return this.nextSeed();
    }
  }
  return Random;
})();
