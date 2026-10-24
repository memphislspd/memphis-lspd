// pages/api/check-criminal.js
import { verifyToken } from '../../lib/discord';
import { kv } from '@vercel/kv';
import { checkCriminalActivity } from '../../lib/security';

const WEBHOOK_SECURITY = process.env.WEBHOOK_SECURITY;

export default async function handler(req, res) {
  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const cacheKey = `criminal_checked:${user.id}`;
  const lastCheck = await kv.get(cacheKey);
  if (lastCheck) return res.status(200).json({ cached: true });

  const accessToken = await kv.get(`oauth:token:${user.id}`);
  const userGuildsRaw = await kv.get(`user:guilds:${user.id}`);
  
  if (!accessToken || !userGuildsRaw) {
    return res.status(400).json({ error: 'No token or guilds data' });
  }

  const userGuildIds = JSON.parse(userGuildsRaw);

  // Запускаем быструю проверку (только по тем серверам, где он есть)
  const alerts = await checkCriminalActivity(accessToken, userGuildIds);

  if (alerts.length > 0 && WEBHOOK_SECURITY) {
    // ... (тут твой код отправки вебхука, он не меняется) ...
    const fields = alerts.map(a => ({
      name: `🚨 Сервер: ${a.guildName}`,
      value: `Найдены роли: **${a.matchedRoles.join(', ')}**\nID: \`${a.guildId}\``,
      inline: false
    }));

    await fetch(WEBHOOK_SECURITY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `<@${user.id}>`,
        embeds: [{
          title: '⚠️ Проверка на крайм-активность',
          color: 0xFF0000,
          author: {
            name: `${user.username} (${user.id})`,
            icon_url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
          },
          fields: fields,
          timestamp: new Date().toISOString(),
        }],
      }),
    });
    console.log(`✅ Найдено ${alerts.length} совпадений. Вебхук отправлен.`);
  }

  await kv.set(cacheKey, '1', { ex: 12 * 3600 });
  res.status(200).json({ success: true, alerts });
}
