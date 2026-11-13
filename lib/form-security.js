import { kv } from '@vercel/kv';

const INCREMENT_WITH_EXPIRY_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('EXPIRE', KEYS[1], tonumber(ARGV[1]))
end
return count
`;

export async function checkFormRateLimit(userId, formName, limit = 3, windowSeconds = 900) {
  const key = `lspd:form-rate:${formName}:${userId}`;
  const count = Number(await kv.eval(INCREMENT_WITH_EXPIRY_SCRIPT, [key], [windowSeconds]));
  if (!Number.isSafeInteger(count) || count < 1) {
    throw new Error('Form rate-limit storage returned an invalid count');
  }
  return count <= limit;
}

export function isBoundedText(value, maxLength, { optional = false } = {}) {
  if (optional && (value === undefined || value === null || value === '')) return true;
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

export function isHttpsUrl(value, { optional = false } = {}) {
  if (optional && (value === undefined || value === null || value === '')) return true;
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !!url.hostname;
  } catch {
    return false;
  }
}

export function areHttpsUrls(value, { optional = false } = {}) {
  if (optional && (value === undefined || value === null || value === '')) return true;
  if (typeof value !== 'string' || value.length > 2048) return false;
  const urls = value.split(/\s+/).filter(Boolean);
  return urls.length > 0 && urls.every(url => isHttpsUrl(url));
}
