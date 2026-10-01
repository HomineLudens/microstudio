"use strict";
// XP-to-level-up cost table, precomputed for levels 0-499.
// Plain Node CommonJS module (not part of the browser concatenation
// bundles — required directly via server/gamify/userprogress.coffee).
// The original CoffeeScript exports a singleton instance (`new @Levels()`),
// not the class itself.
class Levels {
    constructor() {
        this.total_cost = [];
        let sum = 0;
        for (let i = 0; i <= 499; i += 1) {
            sum += this.costOfLevelUp(i);
            this.total_cost[i] = sum;
        }
    }
    costOfLevelUp(from_level) {
        return (from_level + 5) * (from_level + 5) * 20;
    }
}
module.exports = new Levels();
