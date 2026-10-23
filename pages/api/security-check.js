import { verifyToken } from '../../lib/discord';
import { kv } from '@vercel/kv';
import { checkCriminalActivity } from '../../lib/security';

const WEBHOOK_SECURITY = process.env.WEBHOOK_SECURITY;

export default async function handler(req, res) {
  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // Проверяем только раз в час, чтобы не спамить Discord API
  const cacheKey = `security:checked:${user.id}`;
  const lastCheck = await kv.get(cacheKey);
  if (lastCheck) return res.status(200).json({ cached: true });

  // Достаем токен из KV (он сохраняется при логине)
  const accessToken = await kv.get(`oauth:token:${user.id}`);
  if (!accessToken) return res.status(400).json({ error: 'No token' });

  // Запускаем проверку по всем фамкам
  const alerts = await checkCriminalActivity(accessToken);

  // Если что-то нашли — отправляем лог в Discord
  if (alerts.length > 0) {
    if (!WEBHOOK_SECURITY) {
      console.error('WEBHOOK_SECURITY не настроен в Vercel!');
      return res.status(500).json({ error: 'Webhook missing' });
    }

    const fields = alerts.map(a => ({
      name: `🚨 Сервер: ${a.guildName}`,
      value: `Найдены роли: **${a.matchedRoles.join(', ')}**\nID сервера: \`${a.guildId}\``,
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
          footer: { text: 'Система безопасности LSPD' },
          timestamp: new Date().toISOString(),
        }],
      }),
    });

    // Сохраняем в базу, что этот юзер найден (для истории)
    await kv.set(`security:found:${user.id}`, JSON.stringify(alerts), { ex: 86400 * 7 });
  }

  // Ставим кэш на 1 час
  await kv.set(cacheKey, '1', { ex: 3600 });

  res.status(200).json({ success: true, alerts });
}
