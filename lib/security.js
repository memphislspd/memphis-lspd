// lib/security.js

// ============================================
// СПИСОК КРАЙМ-ГИЛЬДИЙ И ИХ РОЛЕЙ
// ============================================

export const CRIM_GUILDS = [
  {
    id: '1087019411052961842', // Сервер Скримз
    name: 'Скримз',
    roles: [
      { id: '1087034549835415604', name: 'Скримзы' },
      { id: '1389947183834468402', name: 'Скримзы' },
    ]
  },
  {
    id: '1164353685132951603', // Сервер Кортез
    name: 'Кортез',
    roles: [
      { id: '1393333346523938958', name: 'Кортезы' },
      { id: '1389687041066926190', name: 'Кортезы' },
    ]
  },
  {
    id: '1258546253558710333', // Сервер Корпсес
    name: 'Корпсес',
    roles: [
      { id: '1258547890020683836', name: 'Корпсесы' },
      { id: '1258548800868585522', name: 'Корпсесы' },
    ]
  },
  {
    id: '788056890533740574', // Сервер АГ
    name: 'АГ',
    roles: [
      { id: '1280960634611306618', name: 'Аллегри' },
      { id: '836647378819088384', name: 'Аллегри' },
      { id: '940506118109683742', name: 'Аллегри' },
      { id: '1548290961426350242', name: 'Аллегри' },
      { id: '1262374026400108645', name: 'Аллегри' },
    ]
  },
  {
    id: '561991307480924160', // Сервер БХ
    name: 'БХ',
    roles: [
      { id: '1513866991289630750', name: 'Банхаммеры' },
      { id: '691363966722637874', name: 'Банхаммеры' },
      { id: '1550484421210021888', name: 'Банхаммеры' },
      { id: '1558131725354406078', name: 'Банхаммеры' },
      { id: '1513866211056681090', name: 'Банхаммеры' },
    ]
  },
  {
    id: '1218022995025592330', // Сервер Гучи
    name: 'Гучи',
    roles: [
      { id: '1218150691176972380', name: 'Гучи' },
      { id: '1433577958546604063', name: 'Гучи' },
      { id: '1240670015863128135', name: 'Гучи' },
      { id: '1218150689172357334', name: 'Гучи' },
      { id: '1218150686856839209', name: 'Гучи' },
    ]
  },
  {
    id: '922630047129567312', // Сервер Узи
    name: 'Узи',
    roles: [
      { id: '1266087195060600854', name: 'Узи' },
      { id: '957772318812295228', name: 'Узи' },
      { id: '1419356621389434890', name: 'Узи' },
      { id: '1204470144622141450', name: 'Узи' },
    ]
  },
  {
    id: '1282692203839225977', // Сервер Альянсы
    name: 'Альянсы',
    roles: [
      { id: '1282692203839225980', name: 'Альянсы' },
      { id: '1522343905809666149', name: 'Альянсы' },
    ]
  },
  {
    id: '1229839837008494702', // Сервер Сайзы
    name: 'Сайзы',
    roles: [] 
  }
];

// LSPD roles drive admin access and /hub. Criminal roles are checked on these guilds only.
export const LSPD_GUILD_ID = '1514608894666735717';

export function getRoleGuildIds() {
  return [...new Set([
    LSPD_GUILD_ID,
    ...CRIM_GUILDS.filter(guild => guild.roles.length > 0).map(guild => guild.id),
  ])];
}

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

// OAuth's guilds scope returns guild IDs, not member role IDs. Fetch member roles once
// during login for the small set of guilds actually used by the application.
export async function fetchUserGuildRoles(accessToken, userGuildIds) {
  const userGuildSet = new Set(userGuildIds);
  const guildRoles = {};
  const failedGuilds = [];
  const roleGuildIds = getRoleGuildIds();

  // Clear tracked guilds the user no longer belongs to. Failed member lookups are
  // omitted so a previous snapshot can be retained and retried later.
  for (const guildId of roleGuildIds) {
    if (!userGuildSet.has(guildId)) guildRoles[guildId] = [];
  }

  const memberGuildIds = roleGuildIds.filter(guildId => userGuildSet.has(guildId));
  for (let index = 0; index < memberGuildIds.length; index++) {
    const guildId = memberGuildIds[index];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(
        `https://discord.com/api/users/@me/guilds/${guildId}/member`,
        { headers: { Authorization: `Bearer ${accessToken}` }, signal: controller.signal }
      );

      if (response.status === 404) {
        guildRoles[guildId] = [];
      } else if (response.status === 429) {
        const payload = await response.json().catch(() => ({}));
        const headerRetryAfter = Number(response.headers.get('retry-after'));
        const bodyRetryAfter = Number(payload.retry_after);
        const retryAfterSeconds = Number.isFinite(headerRetryAfter) && headerRetryAfter > 0
          ? headerRetryAfter
          : (Number.isFinite(bodyRetryAfter) && bodyRetryAfter > 0 ? bodyRetryAfter : 5);
        failedGuilds.push({ guildId, status: 429 });
        return { guildRoles, failedGuilds, rateLimited: true, retryAfterSeconds };
      } else if (!response.ok) {
        failedGuilds.push({ guildId, status: response.status });
      } else {
        const member = await response.json();
        guildRoles[guildId] = Array.isArray(member.roles) ? member.roles : [];
      }
    } catch (error) {
      failedGuilds.push({
        guildId,
        reason: error?.name === 'AbortError' ? 'timeout' : 'network_error',
      });
    } finally {
      clearTimeout(timeout);
    }
    if (index < memberGuildIds.length - 1) await wait(300);
  }

  return { guildRoles, failedGuilds, rateLimited: false };
}

// Uses the OAuth role snapshot first. Discord is contacted only for guilds whose
// role data was not captured at login or during a previous partial check.
export async function checkCriminalActivity(accessToken, userGuildIds, cachedGuildRoles = {}) {
  const result = {
    alerts: [],
    complete: false,
    checkedGuilds: 0,
    totalGuilds: 0,
    failedGuilds: [],
    guildRoles: cachedGuildRoles && typeof cachedGuildRoles === 'object' && !Array.isArray(cachedGuildRoles)
      ? { ...cachedGuildRoles }
      : {},
    retryAfterSeconds: 0,
  };

  if (!Array.isArray(userGuildIds)) {
    result.failedGuilds.push({ reason: 'missing_guild_list' });
    return result;
  }

  const userGuildSet = new Set(userGuildIds);
  const relevantGuilds = CRIM_GUILDS.filter(guild =>
    userGuildSet.has(guild.id) && guild.roles.length > 0
  );
  result.totalGuilds = relevantGuilds.length;

  if (relevantGuilds.length === 0) {
    result.complete = true;
    return result;
  }

  for (let index = 0; index < relevantGuilds.length; index++) {
    const guild = relevantGuilds[index];
    let userRoles = result.guildRoles[guild.id];

    if (!Array.isArray(userRoles)) {
      if (!accessToken) {
        result.failedGuilds.push({ guildName: guild.name, reason: 'missing_access_token' });
        continue;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      let response;
      try {
        response = await fetch(
          `https://discord.com/api/users/@me/guilds/${guild.id}/member`,
          { headers: { Authorization: `Bearer ${accessToken}` }, signal: controller.signal }
        );
      } catch (error) {
        result.failedGuilds.push({
          guildName: guild.name,
          reason: error?.name === 'AbortError' ? 'timeout' : 'network_error',
        });
        clearTimeout(timeout);
        continue;
      }
      clearTimeout(timeout);

      if (response.status === 404) {
        userRoles = [];
      } else if (response.status === 429) {
        const payload = await response.json().catch(() => ({}));
        const headerRetryAfter = Number(response.headers.get('retry-after'));
        const bodyRetryAfter = Number(payload.retry_after);
        result.retryAfterSeconds = Number.isFinite(headerRetryAfter) && headerRetryAfter > 0
          ? headerRetryAfter
          : (Number.isFinite(bodyRetryAfter) && bodyRetryAfter > 0 ? bodyRetryAfter : 5);
        result.failedGuilds.push({
          guildName: guild.name,
          status: 429,
          reason: 'rate_limited',
        });
        break;
      } else if (!response.ok) {
        result.failedGuilds.push({
          guildName: guild.name,
          status: response.status,
          reason: 'discord_api_error',
        });
        continue;
      } else {
        try {
          const member = await response.json();
          userRoles = Array.isArray(member.roles) ? member.roles : [];
        } catch {
          result.failedGuilds.push({
            guildName: guild.name,
            reason: 'invalid_discord_response',
          });
          continue;
        }
      }
      result.guildRoles[guild.id] = userRoles;
    }

    result.checkedGuilds += 1;
    const matchedRoles = guild.roles.filter(role => userRoles.includes(role.id));
    if (matchedRoles.length > 0) {
      result.alerts.push({
        guildName: guild.name,
        guildId: guild.id,
        matchedRoles: [...new Set(matchedRoles.map(role => role.name))],
      });
    }

    if (index < relevantGuilds.length - 1 && !result.retryAfterSeconds) await wait(300);
  }

  result.complete =
    result.failedGuilds.length === 0 &&
    result.checkedGuilds === result.totalGuilds;
  return result;
}
