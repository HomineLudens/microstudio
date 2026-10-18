const assert = require("assert");

global.fengari = require("fengari-web");
global.window = global;

const values = {
  legacyArray: [null, "null"],
  legacyObject: {
    name: "old",
    nested: {
      enabled: true
    }
  },
  malformedLuaTable: {
    __microstudio_lua_table_v1__: true,
    entries: {}
  },
  nullValue: null
};

const storage = {
  get(name) {
    return Object.prototype.hasOwnProperty.call(values, name) ? values[name] : 0;
  },
  set(name, value) {
    values[name] = JSON.parse(JSON.stringify(value));
    return value;
  }
};

const context = {
  global: {
    storage
  },
  meta: {
    print() {}
  }
};

global.ctx = context.global;

const Runner = require("../../static/js/languages/lua/runner.js").Runner;
const runner = new Runner({ context });

runner.run(`
  local data = {
    clicks = 4,
    runs = 2,
    nested = { enabled = true, list = { "a", "b" } },
    [7] = "number",
    [false] = "boolean",
    ["7"] = "string"
  }
  storage:set("data", data)
  local loaded = storage:get("data")
  assert(type(loaded) == "table")
  assert(loaded.clicks == 4 and loaded.runs == 2)
  assert(loaded.nested.enabled and loaded.nested.list[2] == "b")
  assert(loaded[7] == "number" and loaded[false] == "boolean")
  assert(loaded["7"] == "string")

  storage:set("empty", {})
  assert(next(storage:get("empty")) == nil)
  storage:set("primitive", true)
  assert(storage:get("primitive") == true)

  assert(storage:get("nullValue") == nil)
  local legacyArray = storage:get("legacyArray")
  assert(legacyArray[1] == nil and legacyArray[2] == "null")
  local legacyObject = storage:get("legacyObject")
  assert(legacyObject.name == "old" and legacyObject.nested.enabled)
`);

assert.throws(
  () => runner.run(`local cyclic = {}; cyclic.self = cyclic; storage:set("cyclic", cyclic)`),
  /cyclic tables/
);
assert.throws(
  () => runner.run(`storage:set("infinite", math.huge)`),
  /non-finite numbers/
);
assert.throws(
  () => runner.run(`local data = {}; data[math.huge] = "value"; storage:set("infinite-key", data)`),
  /non-finite numeric keys/
);
assert.throws(
  () => runner.run(`storage:set("function", { callback = function() end })`),
  /cannot save functions, userdata, or threads/
);
assert.throws(
  () => runner.run(`local key = {}; local data = {}; data[key] = "value"; storage:set("table-key", data)`),
  /only supports string, numeric, and boolean table keys/
);
assert.throws(
  () => runner.run(`storage:get("malformedLuaTable")`),
  /contains an invalid Lua table/
);

console.log("Lua storage table tests passed");
