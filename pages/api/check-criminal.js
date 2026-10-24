// pages/api/check-criminal.js
import { verifyToken } from '../../lib/discord';
import { kv } from '@vercel/kv';
import { checkCriminalActivity } from '../../lib/security';

const WEBHOOK_SECURITY = process.env.WEBHOOK_SECURITY;

export default async function handler(req, res) {
  try {
    const user = verifyToken(req.cookies.token);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // ВРЕМЕННО ОТКЛЮЧАЕМ КЭШ ДЛЯ ТЕСТА:
    // const cacheKey = `criminal_checked:${user.id}`;
    // const lastCheck = await kv.get(cacheKey);
    // if (lastCheck) return res.status(200).json({ cached: true });

    const accessToken = await kv.get(`oauth:token:${user.id}`);
    const userGuildIds = await kv.get(`user:guilds:${user.id}`);
    
    console.log(`[ДЕБАГ] Достали из базы список серверов юзера:`, userGuildIds);

    if (!accessToken || !userGuildIds) {
      console.log(`[КРАЙМ] Нет данных в KV для юзера ${user.id}. Возможно, он не перелогинился.`);
      return res.status(200).json({ success: true, message: 'No data yet' });
    }

    const alerts = await checkCriminalActivity(accessToken, userGuildIds);

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
    } else if (alerts.length === 0) {
      console.log(`✅ Проверка завершена. Совпадений нет.`);
    }

    // await kv.set(cacheKey, '1', { ex: 12 * 3600 });
    res.status(200).json({ success: true, alerts });
  } catch (error) {
    console.error('[КРАЙМ] Критическая ошибка:', error.message);
    res.status(200).json({ success: false, error: error.message });
  }
}
