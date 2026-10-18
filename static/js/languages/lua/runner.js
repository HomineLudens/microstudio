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
    src += "local jsStorage = storage\nlocal tableMarker = \"__microstudio_lua_table_v1__\"\n\nlocal function toJS(value, active)\n  local valueType = type(value)\n  if valueType ~= \"table\" then\n    if valueType == \"function\" or valueType == \"userdata\" or valueType == \"thread\" then\n      return nil\n    end\n    return value\n  end\n\n  if active[value] then\n    error(\"storage:set cannot save cyclic tables\")\n  end\n  active[value] = true\n\n  local result = js.new(js.global.Object)\n  result[tableMarker] = true\n  local entries = js.new(js.global.Array)\n  result.entries = entries\n  local index = 0\n  for key, item in pairs(value) do\n    local keyType = type(key)\n    local itemType = type(item)\n    if (keyType == \"string\" or keyType == \"number\" or keyType == \"boolean\") and\n        (itemType == \"string\" or itemType == \"number\" or itemType == \"boolean\" or itemType == \"table\") then\n      local pair = js.new(js.global.Array)\n      pair[0] = key\n      pair[1] = toJS(item, active)\n      entries[index] = pair\n      index = index + 1\n    end\n  end\n\n  active[value] = nil\n  return result\nend\n\nlocal function fromJS(value)\n  if value == nil or js.typeof(value) ~= \"object\" then\n    return value\n  end\n\n  local isArray = js.instanceof(value, js.global.Array)\n  if not isArray and js.tostring(value) == \"null\" then\n    return nil\n  end\n\n  local result = {}\n  if value[tableMarker] == true then\n    local entries = value.entries\n    for index = 0, entries.length - 1 do\n      local pair = entries[index]\n      result[pair[0]] = fromJS(pair[1])\n    end\n  elseif isArray then\n    for index = 0, value.length - 1 do\n      result[index + 1] = fromJS(value[index])\n    end\n  else\n    local keys = js.global.Object.keys(value)\n    for index = 0, keys.length - 1 do\n      local key = keys[index]\n      result[key] = fromJS(value[key])\n    end\n  end\n  return result\nend\n\nstorage = {\n  get = function(self, name)\n    return fromJS(jsStorage:get(name))\n  end,\n  set = function(self, name, value)\n    return jsStorage:set(name, toJS(value, {}))\n  end\n}";
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
