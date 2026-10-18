LUA_STORAGE_WRAPPER = """
  local jsStorage = storage
  local tableMarker = "__microstudio_lua_table_v1__"

  local function isFiniteNumber(value)
    return value == value and value ~= math.huge and value ~= -math.huge
  end

  local function toJS(value, active)
    local valueType = type(value)
    if valueType ~= "table" then
      if valueType == "function" or valueType == "userdata" or valueType == "thread" then
        return nil
      end
      if valueType == "number" and not isFiniteNumber(value) then
        error("storage:set cannot save non-finite numbers")
      end
      return value
    end

    if active[value] then
      error("storage:set cannot save cyclic tables")
    end
    active[value] = true

    local result = js.new(js.global.Object)
    result[tableMarker] = true
    local entries = js.new(js.global.Array)
    result.entries = entries
    local index = 0
    for key, item in pairs(value) do
      local keyType = type(key)
      local itemType = type(item)
      if keyType == "number" and not isFiniteNumber(key) then
        error("storage:set cannot save non-finite numeric keys")
      end
      if (keyType == "string" or keyType == "number" or keyType == "boolean") and
          (itemType == "string" or itemType == "number" or itemType == "boolean" or itemType == "table") then
        local pair = js.new(js.global.Array)
        pair[0] = key
        pair[1] = toJS(item, active)
        entries[index] = pair
        index = index + 1
      end
    end

    active[value] = nil
    return result
  end

  local function fromJS(value)
    if value == nil or js.typeof(value) ~= "object" then
      return value
    end

    local isArray = js.instanceof(value, js.global.Array)
    if not isArray and js.tostring(value) == "null" then
      return nil
    end

    local result = {}
    if value[tableMarker] == true then
      local entries = value.entries
      for index = 0, entries.length - 1 do
        local pair = entries[index]
        result[pair[0]] = fromJS(pair[1])
      end
    elseif isArray then
      for index = 0, value.length - 1 do
        result[index + 1] = fromJS(value[index])
      end
    else
      local keys = js.global.Object.keys(value)
      for index = 0, keys.length - 1 do
        local key = keys[index]
        result[key] = fromJS(value[key])
      end
    end
    return result
  end

  storage = {
    get = function(self, name)
      return fromJS(jsStorage:get(name))
    end,
    set = function(self, name, value)
      return jsStorage:set(name, toJS(value, {}))
    end
  }
"""

class @Runner
  constructor:(@microvm)->

  init:()->
    @initialized = true

    window.ctx = @microvm.context.global
    window.ctx.print = (text)=> @microvm.context.meta.print text
    src = "js = require 'js'"
    for key of @microvm.context.global
      kd = key
      src += """#{kd} =  js.global.ctx.#{key}\n"""

    src += """print = function(text) js.global.ctx:print(text) end\n"""
    src += "new = js.new\n"
    src += LUA_STORAGE_WRAPPER
    @run(src)

  run:(program,name="")->
    if not @initialized
      @init()

    #console.info program
    try
      res = fengari.load(program,name)()
    catch err

      line = err.toString().split("]:")[1]
      if line?
        line = line.split(":")[0] or 1
      else
        line = 0

      @microvm.context.location =
        token:
          line: line
          column: 0
      throw err.toString()

    return res

  call:(name,args)->
    try
      res = fengari.load("if #{name} then #{name}() end")()
      res
    catch err
      line = err.toString().split("]:")[1]
      if line?
        line = line.split(":")[0] or 1
      else
        line = 0

      file = err.toString().split('"')[1] or ""
      @microvm.context.location =
        token:
          line: line
          column: 0
          file: file
      throw err.toString()

  toString:(obj)->
    if obj?
      obj.toString()
    else
      "nil"
