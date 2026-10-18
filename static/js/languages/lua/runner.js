var LUA_STORAGE_WRAPPER;

LUA_STORAGE_WRAPPER = "local jsStorage = storage\nlocal tableMarker = \"__microstudio_lua_table_v1__\"\n\nlocal function isFiniteNumber(value)\n  return value == value and value ~= math.huge and value ~= -math.huge\nend\n\nlocal function toJS(value, active, depth)\n  if depth > 100 then\n    error(\"storage:set cannot save tables nested deeper than 100 levels\")\n  end\n\n  local valueType = type(value)\n  if valueType ~= \"table\" then\n    if valueType == \"function\" or valueType == \"userdata\" or valueType == \"thread\" then\n      error(\"storage:set cannot save functions, userdata, or threads\")\n    end\n    if valueType == \"number\" and not isFiniteNumber(value) then\n      error(\"storage:set cannot save non-finite numbers\")\n    end\n    return value\n  end\n\n  if active[value] then\n    error(\"storage:set cannot save cyclic tables\")\n  end\n  active[value] = true\n\n  local result = js.new(js.global.Object)\n  result[tableMarker] = true\n  local entries = js.new(js.global.Array)\n  result.entries = entries\n  local index = 0\n  for key, item in pairs(value) do\n    local keyType = type(key)\n    if keyType ~= \"string\" and keyType ~= \"number\" and keyType ~= \"boolean\" then\n      error(\"storage:set only supports string, numeric, and boolean table keys\")\n    end\n    if keyType == \"number\" and not isFiniteNumber(key) then\n      error(\"storage:set cannot save non-finite numeric keys\")\n    end\n    local pair = js.new(js.global.Array)\n    pair[0] = key\n    pair[1] = toJS(item, active, depth + 1)\n    entries[index] = pair\n    index = index + 1\n  end\n\n  active[value] = nil\n  return result\nend\n\nlocal function fromJS(value, active, depth)\n  if depth > 100 then\n    error(\"storage contains tables nested deeper than 100 levels\")\n  end\n  if value == nil or js.typeof(value) ~= \"object\" then\n    return value\n  end\n\n  if value == js.null then\n    return nil\n  end\n\n  local isArray = js.instanceof(value, js.global.Array)\n  if active[value] then\n    error(\"storage contains cyclic data\")\n  end\n  active[value] = true\n\n  local result = {}\n  if value[tableMarker] == true then\n    local entries = value.entries\n    if not js.instanceof(entries, js.global.Array) then\n      error(\"storage contains an invalid Lua table\")\n    end\n    for index = 0, entries.length - 1 do\n      local pair = entries[index]\n      if not js.instanceof(pair, js.global.Array) or pair.length ~= 2 then\n        error(\"storage contains an invalid Lua table\")\n      end\n      local key = pair[0]\n      local keyType = type(key)\n      if keyType ~= \"string\" and keyType ~= \"number\" and keyType ~= \"boolean\" then\n        error(\"storage contains an invalid Lua table key\")\n      end\n      if keyType == \"number\" and not isFiniteNumber(key) then\n        error(\"storage contains an invalid Lua table key\")\n      end\n      result[key] = fromJS(pair[1], active, depth + 1)\n    end\n  elseif isArray then\n    for index = 0, value.length - 1 do\n      result[index + 1] = fromJS(value[index], active, depth + 1)\n    end\n  else\n    local keys = js.global.Object:keys(value)\n    for index = 0, keys.length - 1 do\n      local key = keys[index]\n      result[key] = fromJS(value[key], active, depth + 1)\n    end\n  end\n  active[value] = nil\n  return result\nend\n\nstorage = {\n  get = function(self, name)\n    return fromJS(jsStorage:get(name), {}, 0)\n  end,\n  set = function(self, name, value)\n    return jsStorage:set(name, toJS(value, {}, 0))\n  end\n}";

this.Runner = (function() {
  function Runner(microvm) {
    this.microvm = microvm;
  }

  Runner.prototype.init = function() {
    var kd, key, src;
    this.initialized = true;
    window.ctx = this.microvm.context.global;
    window.ctx.print = (function(_this) {
      return function(text) {
        return _this.microvm.context.meta.print(text);
      };
    })(this);
    src = "js = require 'js'";
    for (key in this.microvm.context.global) {
      kd = key;
      src += kd + " =  js.global.ctx." + key + "\n";
    }
    src += "print = function(text) js.global.ctx:print(text) end\n";
    src += "new = js.new\n";
    src += LUA_STORAGE_WRAPPER;
    return this.run(src);
  };

  Runner.prototype.run = function(program, name) {
    var err, line, res;
    if (name == null) {
      name = "";
    }
    if (!this.initialized) {
      this.init();
    }
    try {
      res = fengari.load(program, name)();
    } catch (error) {
      err = error;
      line = err.toString().split("]:")[1];
      if (line != null) {
        line = line.split(":")[0] || 1;
      } else {
        line = 0;
      }
      this.microvm.context.location = {
        token: {
          line: line,
          column: 0
        }
      };
      throw err.toString();
    }
    return res;
  };

  Runner.prototype.call = function(name, args) {
    var err, file, line, res;
    try {
      res = fengari.load("if " + name + " then " + name + "() end")();
      return res;
    } catch (error) {
      err = error;
      line = err.toString().split("]:")[1];
      if (line != null) {
        line = line.split(":")[0] || 1;
      } else {
        line = 0;
      }
      file = err.toString().split('"')[1] || "";
      this.microvm.context.location = {
        token: {
          line: line,
          column: 0,
          file: file
        }
      };
      throw err.toString();
    }
  };

  Runner.prototype.toString = function(obj) {
    if (obj != null) {
      return obj.toString();
    } else {
      return "nil";
    }
  };

  return Runner;

})();
