import { kv } from '@vercel/kv';

const HOURLY_LIMIT = 6;
const HOURLY_WINDOW = 7200;
const BURST_LIMIT = 10;
const BURST_WINDOW = 5;
const IP_LIMIT = 6;
const IP_WINDOW = 600;

const CHECK_AND_INCREMENT_SCRIPT = `
local ipEnabled = ARGV[7] == '1'
local ipCount = 0
if ipEnabled then
  ipCount = tonumber(redis.call('GET', KEYS[3]) or '0')
  if ipCount >= tonumber(ARGV[4]) then
    return {1, 1, ipCount, 0}
  end
end

local burstCount = tonumber(redis.call('GET', KEYS[2]) or '0')
if burstCount >= tonumber(ARGV[5]) then
  return {1, 2, burstCount, 0}
end

local hourlyCount = tonumber(redis.call('GET', KEYS[1]) or '0')
if hourlyCount >= tonumber(ARGV[6]) then
  return {1, 3, hourlyCount, redis.call('TTL', KEYS[1])}
end

local function incrementWithExpiry(key, ttl)
  local count = redis.call('INCR', key)
  if count == 1 then
    redis.call('EXPIRE', key, ttl)
  end
  return count
end

local newHourly = incrementWithExpiry(KEYS[1], tonumber(ARGV[1]))
local newBurst = incrementWithExpiry(KEYS[2], tonumber(ARGV[2]))
if ipEnabled then
  ipCount = incrementWithExpiry(KEYS[3], tonumber(ARGV[3]))
end

return {0, 0, newHourly, newBurst, ipCount}
`;

export async function checkSpam(userId, ip) {
  const hasIp = Boolean(ip && ip !== 'unknown' && ip !== 'неизвестен');
  const result = await kv.eval(
    CHECK_AND_INCREMENT_SCRIPT,
    [
      `lspd:spam:hourly:${userId}`,
      `lspd:spam:burst:${userId}`,
      `lspd:spam:ip:${hasIp ? ip : 'unknown'}`
    ],
    [
      HOURLY_WINDOW,
      BURST_WINDOW,
      IP_WINDOW,
      IP_LIMIT,
      BURST_LIMIT,
      HOURLY_LIMIT,
      hasIp ? '1' : '0'
    ]
  );

  if (!Array.isArray(result) || result.length < 2) {
    throw new Error('Spam protection returned an invalid storage response');
  }

  const [blocked, reasonCode, , ttl] = result.map(Number);
  if (!blocked) return { isSpam: false };

  if (reasonCode === 1) {
    return { isSpam: true, ban: true, reason: 'IP-бан', message: '🚫 С вашего IP слишком много заявок.' };
  }
  if (reasonCode === 2) {
    return { isSpam: true, ban: true, reason: 'Спам-атака', message: '🚫 Обнаружена спам-атака!' };
  }
  if (reasonCode === 3) {
    const remainingSeconds = Number.isFinite(ttl) && ttl > 0 ? ttl : HOURLY_WINDOW;
    const minutes = Math.ceil(remainingSeconds / 60);
    return { isSpam: true, ban: false, reason: 'Лимит заявок', message: `⏳ Лимит ${HOURLY_LIMIT} заявок. Подождите ${minutes} мин.` };
  }

  throw new Error('Spam protection returned an unknown limit result');
}

export async function resetSpam(userId, ip) {
  const keys = [
    `lspd:spam:hourly:${userId}`,
    `lspd:spam:burst:${userId}`
  ];
  if (ip) keys.push(`lspd:spam:ip:${ip}`);
  await Promise.all(keys.map(key => kv.del(key)));
}
