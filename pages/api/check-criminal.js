// pages/api/check-criminal.js
import { verifyToken } from '../../lib/discord';
import { kv } from '@vercel/kv';
import { CRIM_GUILDS } from '../../lib/security';

const WEBHOOK_SECURITY = process.env.WEBHOOK_SECURITY;

export default async function handler(req, res) {
  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // Кэш: проверяем не чаще, чем раз в 12 часов
  const cacheKey = `criminal_checked:${user.id}`;
  const lastCheck = await kv.get(cacheKey);
  if (lastCheck) return res.status(200).json({ cached: true });

  const accessToken = await kv.get(`oauth:token:${user.id}`);
  if (!accessToken) return res.status(400).json({ error: 'No token' });

  const alerts = [];

  // Идем по списку серверов строго ПО ОЧЕРЕДИ
  for (const guild of CRIM_GUILDS) {
    if (guild.roles.length === 0) continue;

    try {
      const resFetch = await fetch(
        `https://discord.com/api/users/@me/guilds/${guild.id}/member`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      // Если Дискорд просит подождать (429)
      if (resFetch.status === 429) {
        const data = await resFetch.json();
        const waitMs = (data.retry_after || 1) * 1000;
        console.log(`[КРАЙМ] 429 лимит. Ждем ${waitMs}мс и пропускаем сервер ${guild.name}`);
        
        // Ждем ровно столько, сколько просит Дискорд, и идем к следующему
        await new Promise(r => setTimeout(r, waitMs)); 
        continue; 
      }

      if (resFetch.status === 404) continue; // Нет на сервере
      if (!resFetch.ok) continue; // Другая ошибка

      const member = await resFetch.json();
      const userRoles = member.roles || [];
      const matchedRoles = guild.roles.filter(r => userRoles.includes(r.id));

      if (matchedRoles.length > 0) {
        const uniqueRoles = [...new Set(matchedRoles.map(r => r.name))];
        alerts.push({
          guildName: guild.name,
          guildId: guild.id,
          matchedRoles: uniqueRoles,
        });
      }

      // Небольшая пауза 300мс, чтобы не провоцировать 429
      await new Promise(r => setTimeout(r, 300));

    } catch (e) {
      console.error(`[КРАЙМ] Ошибка на сервере ${guild.name}:`, e.message);
    }
  }

  // Если нашли крайм — отправляем лог
  if (alerts.length > 0 && WEBHOOK_SECURITY) {
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

  // Ставим кэш на 12 часов, чтобы не спамить при каждом обновлении страницы
  await kv.set(cacheKey, '1', { ex: 12 * 3600 });

  res.status(200).json({ success: true, alerts });
}
