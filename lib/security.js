// lib/security.js
export const CRIM_GUILDS = [
  // ... (тут остаются все твои сервера и роли, ничего не меняй) ...
  {
    id: '1514608894666735717', // Твой тестовый сервер
    name: 'LSPD (Тест)',
    roles: [{ id: '1514665211980939314', name: 'Тестовая роль' }]
  }
];

export async function checkCriminalActivity(accessToken) {
  const alerts = [];

  // Делаем все запросы ОДНОВРЕМЕННО, чтобы логин не тормозил
  await Promise.all(CRIM_GUILDS.map(async (guild) => {
    if (guild.roles.length === 0) return;

    try {
      const res = await fetch(
        `https://discord.com/api/users/@me/guilds/${guild.id}/member`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (res.status === 404) return; // Нет на сервере
      if (!res.ok) return; // Ошибка

      const member = await res.json();
      const userRoles = member.roles || [];
      const matchedRoles = guild.roles.filter(r => userRoles.includes(r.id));

      if (matchedRoles.length > 0) {
        alerts.push({
          guildName: guild.name,
          guildId: guild.id,
          matchedRoles: matchedRoles.map(r => r.name),
        });
      }
    } catch (e) {
      console.error(`Ошибка проверки ${guild.id}:`, e.message);
    }
  }));

  return alerts;
}
