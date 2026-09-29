"use strict";
// Seeded pseudo-random number generator used by the runtime/editor.
// Loaded as a plain (non-module) script — see server/concatenator.coffee,
// which concatenates the compiled .js files (or serves them individually in
// dev mode) into a single browser script context. `class Random` therefore
// must remain a top-level, global-scope declaration, not an ES module.
class Random {
    constructor(seed = Math.random()) {
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
    next() {
        this.seed = (this.seed * this.a + this.b) & this.mask;
        return this.seed * this.norm;
    }
    nextInt(num) {
        return Math.floor(this.next() * num);
    }
    nextSeed() {
        return (this.seed = (this.seed * this.a + this.b) & this.mask);
    }
    setSeed(seed) {
        this.seed = seed;
        if (this.seed < 1) {
            this.seed *= 1 << 30;
        }
        this.nextSeed();
        this.nextSeed();
        return this.nextSeed();
    }
}
