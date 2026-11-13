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

const LIST_UPDATE_SCRIPT = `
local values = redis.call('LRANGE', KEYS[1], 0, -1)
local target = ARGV[1]
local updated = {}
for _, value in ipairs(values) do
  local ok, item = pcall(cjson.decode, value)
  if ok and tostring(item.id) == target then item.processed = true; value = cjson.encode(item) end
  table.insert(updated, value)
end
redis.call('DEL', KEYS[1])
for i = 1, #updated do redis.call('RPUSH', KEYS[1], updated[i]) end
return #updated
`;

export async function mutateJsonArray(key, operation, payload) {
  const result = await kv.eval(ARRAY_MUTATION_SCRIPT, [key], [operation, JSON.stringify(payload)]);
  return typeof result === 'string' ? JSON.parse(result) : result;
}

export async function markSubmissionProcessed(id) {
  return kv.eval(LIST_UPDATE_SCRIPT, ['lspd:submissions:all'], [String(id)]);
}
