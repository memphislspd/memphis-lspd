import { kv } from '@vercel/kv';

const ARRAY_MUTATION_SCRIPT = `
local raw = redis.call('GET', KEYS[1])
local items = {}
if raw then
  local ok, decoded = pcall(cjson.decode, raw)
  if not ok or type(decoded) ~= 'table' then return redis.error_reply('Stored value is not a JSON array') end
  items = decoded
end
local op = ARGV[1]
local payload = cjson.decode(ARGV[2])
if op == 'add' then
  table.insert(items, payload)
elseif op == 'update' then
  local found = false
  for i, item in ipairs(items) do
    if tostring(item.id) == tostring(payload.id) then items[i] = payload; found = true; break end
  end
  if not found then return redis.error_reply('Item not found') end
elseif op == 'delete' then
  local kept = {}
  for _, item in ipairs(items) do
    if tostring(item.id) ~= tostring(payload.id) then table.insert(kept, item) end
  end
  items = kept
else
  return redis.error_reply('Unknown operation')
end
local encoded = (#items == 0) and '[]' or cjson.encode(items)
redis.call('SET', KEYS[1], encoded)
return encoded
`;

const ARRAY_PATCH_SCRIPT = `
local raw = redis.call('GET', KEYS[1])
local items = {}
if raw then
  local ok, decoded = pcall(cjson.decode, raw)
  if not ok or type(decoded) ~= 'table' then return redis.error_reply('Stored value is not a JSON array') end
  items = decoded
end
local patch = cjson.decode(ARGV[1])
local found = false
for _, item in ipairs(items) do
  if tostring(item.id) == tostring(patch.id) then
    for key, value in pairs(patch) do
      if key ~= 'id' then item[key] = value end
    end
    found = true
    break
  end
end
if not found then return redis.error_reply('Item not found') end
local encoded = (#items == 0) and '[]' or cjson.encode(items)
redis.call('SET', KEYS[1], encoded)
return encoded
`;

const LIST_UPDATE_SCRIPT = `
local values = redis.call('LRANGE', KEYS[1], 0, -1)
local target = ARGV[1]
local updated = {}
local found = 0
for _, value in ipairs(values) do
  local ok, item = pcall(cjson.decode, value)
  if ok and tostring(item.id) == target then
    item.processed = true
    value = cjson.encode(item)
    found = 1
  end
  table.insert(updated, value)
end
redis.call('DEL', KEYS[1])
for i = 1, #updated do redis.call('RPUSH', KEYS[1], updated[i]) end
return found
`;

export async function mutateJsonArray(key, operation, payload) {
  const result = await kv.eval(ARRAY_MUTATION_SCRIPT, [key], [operation, JSON.stringify(payload)]);
  return typeof result === 'string' ? JSON.parse(result) : result;
}

export async function patchJsonArrayItem(key, patch) {
  const result = await kv.eval(ARRAY_PATCH_SCRIPT, [key], [JSON.stringify(patch)]);
  return typeof result === 'string' ? JSON.parse(result) : result;
}

export async function markSubmissionProcessed(id) {
  return kv.eval(LIST_UPDATE_SCRIPT, ['lspd:submissions:all'], [String(id)]);
}


const STRING_ARRAY_MUTATION_SCRIPT = `
local raw = redis.call('GET', KEYS[1])
local items = {}
if raw then
  local ok, decoded = pcall(cjson.decode, raw)
  if not ok or type(decoded) ~= 'table' then return redis.error_reply('Stored value is not a JSON array') end
  for _, item in ipairs(decoded) do
    if type(item) ~= 'string' then return redis.error_reply('Stored value is not a string array') end
    table.insert(items, item)
  end
end

local operation = ARGV[1]
local target = ARGV[2]
if operation == 'add' then
  local found = false
  for _, item in ipairs(items) do
    if item == target then found = true; break end
  end
  if not found then table.insert(items, target) end
elseif operation == 'remove' then
  local kept = {}
  for _, item in ipairs(items) do
    if item ~= target then table.insert(kept, item) end
  end
  items = kept
else
  return redis.error_reply('Unknown string array operation')
end

local encoded = (#items == 0) and '[]' or cjson.encode(items)
redis.call('SET', KEYS[1], encoded)
return encoded
`;

export async function mutateStringArray(key, operation, value) {
  const result = await kv.eval(STRING_ARRAY_MUTATION_SCRIPT, [key], [operation, String(value)]);
  return typeof result === 'string' ? JSON.parse(result) : result;
}
