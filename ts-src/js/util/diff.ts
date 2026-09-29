// Minimal line-based diff algorithm (longest common contiguous match,
// recursive split) used by the editors to compute change sets.
// Loaded as a plain (non-module) script — see server/concatenator.coffee.
// A top-level `function` declaration is hoisted/redeclaration-safe just
// like the original CoffeeScript's `var diff = function(...) {...}`.
interface DiffChunk {
  type: "-" | "+" | "=";
  data: string[];
}

function diff(before: string | string[], after: string | string[]): DiffChunk[] {
  if (typeof before === "string") {
    before = before.split("\n");
  }
  if (typeof after === "string") {
    after = after.split("\n");
  }

  const result: DiffChunk[] = [];
  const map: { [line: string]: number[] } = {};

  for (let i = 0; i < before.length; i++) {
    const line = before[i];
    let list = map[line];
    if (list == null) {
      list = map[line] = [];
    }
    list.push(i);
  }

  const length = (bi: number, ai: number): number => {
    let len = 0;
    while (bi < before.length && ai < after.length && before[bi++] === after[ai++]) {
      len += 1;
    }
    return len;
  };

  let best_bi = 0;
  let best_ai = 0;
  let best_length = 0;

  for (let ai = 0; ai < after.length; ai++) {
    const line = after[ai];
    const list = map[line];
    if (list != null) {
      for (const bi of list) {
        const score = length(bi, ai);
        if (score > best_length) {
          best_bi = bi;
          best_ai = ai;
          best_length = score;
        }
      }
    }
  }

  if (best_length === 0) {
    if (before.length > 0) {
      result.push({ type: "-", data: before });
    }
    if (after.length > 0) {
      result.push({ type: "+", data: after });
    }
    return result;
  } else {
    return ([] as DiffChunk[]).concat(
      diff(before.slice(0, best_bi), after.slice(0, best_ai)),
      [{ type: "=", data: after.slice(best_ai, best_ai + best_length) }],
      diff(
        before.slice(best_bi + best_length, before.length),
        after.slice(best_ai + best_length, after.length)
      )
    );
  }
}
