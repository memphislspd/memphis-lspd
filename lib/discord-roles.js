import { kv } from '@vercel/kv';

const GUILD_ID = '1514608894666735717';
const ROLE_CACHE_TTL_SECONDS = 7 * 24 * 60 * 60;
const REQUEST_TIMEOUT_MS = 5000;

export async function getCurrentGuildRoles(userId) {
  const id = String(userId || '');
  if (!/^\d{15,22}$/.test(id)) return null;

  let accessToken;
  try {
    accessToken = await kv.get(`oauth:token:${id}`);
  } catch (error) {
    console.error('Discord role lookup token read failed:', error?.name || 'Error');
    return null;
  }

  if (typeof accessToken !== 'string' || !accessToken) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: controller.signal
      }
    );

    // A 404 from this endpoint means the authenticated user is not a guild member.
    if (response.status === 404) return [];

    if (!response.ok) {
      console.error('Discord role lookup rejected:', { status: response.status });
      return null;
    }

    const member = await response.json();
    if (!member || !Array.isArray(member.roles)) return null;

    const roles = member.roles.map(String);
    try {
      await kv.set(`user:roles:${id}`, roles, { ex: ROLE_CACHE_TTL_SECONDS });
    } catch (error) {
      // A cache-write failure must not override the live result from Discord.
      console.error('Discord role cache update failed:', error?.name || 'Error');
    }

    return roles;
  } catch (error) {
    console.error('Discord role lookup failed:', {
      category: error?.name === 'AbortError' ? 'timeout' : 'network_error'
    });
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function hasCurrentGuildRole(userId, roleId) {
  const roles = await getCurrentGuildRoles(userId);
  if (!Array.isArray(roles)) return null;
  return roles.includes(String(roleId));
}
