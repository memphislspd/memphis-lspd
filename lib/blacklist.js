import { kv } from '@vercel/kv';

const BLACKLIST_KEY = 'lspd:blacklist';
const BAN_LOGS_KEY = 'lspd:ban_logs';
const IP_BANS_KEY = 'lspd:ip_bans';

const ADD_BAN_SCRIPT = `
local banData = ARGV[2]
local ip = ARGV[3]
local ipData = ARGV[4]
redis.call('HSET', KEYS[1], ARGV[1], banData)
if ip ~= '' then
  redis.call('HSET', KEYS[2], ip, ipData)
end
redis.call('LPUSH', KEYS[3], ARGV[5])
return 1
`;

const REMOVE_BAN_SCRIPT = `
local data = redis.call('HGET', KEYS[1], ARGV[1])
if data then
  local ok, parsed = pcall(cjson.decode, data)
  if ok and type(parsed) == 'table' and parsed.ip and parsed.ip ~= 'неизвестен' and parsed.ip ~= 'unknown' then
    redis.call('HDEL', KEYS[2], parsed.ip)
  end
end
return redis.call('HDEL', KEYS[1], ARGV[1])
`;

export async function isBlacklisted(userId, ip) {
  try {
    const banned = await kv.hget(BLACKLIST_KEY, userId);
    if (banned) return true;

    if (ip && ip !== 'unknown' && ip !== 'неизвестен') {
      const ipBanned = await kv.hget(IP_BANS_KEY, ip);
      if (ipBanned) return true;
    }

    return false;
  } catch (error) {
    console.error('Blacklist lookup failed:', error);
    throw new Error('Blacklist lookup failed');
  }
}

export async function addToBlacklist(userId, username, reason, ip) {
  const safeIp = ip && ip !== 'unknown' && ip !== 'неизвестен' ? ip : '';
  const timestamp = Date.now();
  const date = new Date(timestamp).toISOString();
  const banData = {
    username,
    reason,
    ip: safeIp || 'неизвестен',
    timestamp,
    date
  };
  const ipData = { userId, username, reason, date };
  const logEntry = {
    userId,
    username,
    reason,
    ip: safeIp || 'неизвестен',
    timestamp,
    date
  };

  try {
    await kv.eval(
      ADD_BAN_SCRIPT,
      [BLACKLIST_KEY, IP_BANS_KEY, BAN_LOGS_KEY],
      [
        String(userId),
        JSON.stringify(banData),
        safeIp,
        JSON.stringify(ipData),
        JSON.stringify(logEntry)
      ]
    );
    console.log(`🚫 ${username} (${userId}) забанен: ${reason}. IP: ${safeIp || 'неизвестен'}`);
  } catch (error) {
    console.error('Blacklist write failed:', error);
    throw new Error('Blacklist write failed');
  }
}

export async function removeFromBlacklist(userId) {
  try {
    const removed = await kv.eval(
      REMOVE_BAN_SCRIPT,
      [BLACKLIST_KEY, IP_BANS_KEY],
      [String(userId)]
    );
    console.log(`✅ ${userId} разбанен`);
    return Number(removed) > 0;
  } catch (error) {
    console.error('Blacklist removal failed:', error);
    throw new Error('Blacklist removal failed');
  }
}

export async function removeIpBan(ip) {
  try {
    await kv.hdel(IP_BANS_KEY, ip);
    console.log(`✅ IP ${ip} разбанен`);
  } catch (error) {
    console.error('IP ban removal failed:', error);
    throw new Error('IP ban removal failed');
  }
}

export async function getBlacklist() {
  try {
    const all = await kv.hgetall(BLACKLIST_KEY);
    if (!all) return [];
    return Object.entries(all).map(([id, data]) => {
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        return { id, ...parsed };
      } catch {
        return { id, data };
      }
    });
  } catch (error) {
    console.error('Blacklist read failed:', error);
    throw new Error('Blacklist read failed');
  }
}

export async function getIpBans() {
  try {
    const all = await kv.hgetall(IP_BANS_KEY);
    if (!all) return [];
    return Object.entries(all).map(([ip, data]) => {
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        return { ip, ...parsed };
      } catch {
        return { ip, data };
      }
    });
  } catch (error) {
    console.error('IP blacklist read failed:', error);
    throw new Error('IP blacklist read failed');
  }
}

export async function getBanLogs(limit = 50) {
  try {
    const logs = await kv.lrange(BAN_LOGS_KEY, 0, limit - 1);
    return logs.map(log => {
      try {
        return JSON.parse(log);
      } catch {
        return log;
      }
    });
  } catch (error) {
    console.error('Ban log read failed:', error);
    throw new Error('Ban log read failed');
  }
}
