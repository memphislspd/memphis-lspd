import { kv } from '@vercel/kv';

export async function checkFormRateLimit(userId, formName, limit = 3, windowSeconds = 900) {
  const key = `lspd:form-rate:${formName}:${userId}`;
  const count = await kv.incr(key);
  if (count === 1) await kv.expire(key, windowSeconds);
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
