// Simple undo/redo state stack used by the editors.
// Loaded as a plain (non-module) script — see server/concatenator.coffee.
// `class @Undo` in the original CoffeeScript compiles to `this.Undo = ...`
// (a property assignment on the global object), so a native `class`
// expression assigned the same way is safe here (unlike a bare top-level
// `class Undo`, which would be a lexical declaration — see random.ts).
(this as any).Undo = class Undo {
  listener: unknown;
  states: unknown[];
  next_state: number;
  max: number;

  constructor(listener: unknown) {
    this.listener = listener;
    this.states = [];
    this.next_state = 0;
    this.max = 30;
  }

  pushState(state: unknown): unknown {
    if (this.next_state >= this.max) {
      this.states.splice(0, 1);
      this.next_state -= 1;
    }

    this.states[this.next_state++] = state;
    while (this.states.length > this.next_state) {
      this.states.splice(this.states.length - 1, 1);
    }
    return state;
  }

  empty(): boolean {
    return this.states.length === 0;
  }

  undo(): unknown {
    if (this.next_state - 2 >= 0 && this.next_state - 2 < this.states.length) {
      this.next_state -= 1;
      return this.states[this.next_state - 1];
    } else {
      return null;
    }
  }

  redo(): unknown {
    if (this.next_state >= 0 && this.next_state < this.states.length) {
      this.next_state += 1;
      return this.states[this.next_state - 1];
    } else {
      return null;
    }
  }
};
