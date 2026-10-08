import { verifyToken } from '../../lib/discord';
import { kv } from '@vercel/kv';

const WEBHOOK_URL = process.env.WEBHOOK_RECOVERY;
const ROLE_PING = '1514608894679191592';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyToken(req.cookies.token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const {
    fullName,
    rank,
    date,
    screenshotInLine,
    screenshotOnMP,
    extraScreenshots,
    comment,
  } = req.body;

  if (!fullName || !rank || !date || !screenshotInLine || !screenshotOnMP) {
    return res.status(400).json({ error: 'Заполните обязательные поля' });
  }

  if (!WEBHOOK_URL) {
    return res.status(500).json({ error: 'Вебхук не настроен' });
  }

  const fields = [
    { name: '👤 Сотрудник', value: `<@${user.id}>`, inline: true },
    { name: '🆔 Discord ID', value: user.id, inline: true },
    { name: '📛 Имя Фамилия + Статик', value: fullName, inline: false },
    { name: '🎖️ Ранг', value: rank, inline: true },
    { name: '📅 Дата выговора', value: date, inline: true },
    { name: '📸 Скрин в строю', value: screenshotInLine, inline: false },
    { name: '📸 Скрин на МП', value: screenshotOnMP, inline: false },
  ];

  (extraScreenshots || []).forEach((s, i) => {
    if (s && s.trim()) {
      fields.push({ name: `📸 Доп. скрин #${i + 1}`, value: s, inline: false });
    }
  });

  if (comment) {
    fields.push({ name: '💬 Комментарий', value: comment, inline: false });
  }

  const embed = {
    title: '📜 Обжалование наказания',
    color: 0x9C27B0,
    author: {
      name: user.username,
      icon_url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
    },
    fields,
    footer: { text: 'LSPD Forms • ' + new Date().toLocaleDateString('ru-RU') },
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `<@&${ROLE_PING}> <@${user.id}>`,
        embeds: [embed],
        username: 'LSPD Forms',
        avatar_url: 'https://i.imgur.com/AfFp7pu.png',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: `Discord: ${errText}` });
    }

    const today = new Date().toISOString().split('T')[0];
    await kv.incr('lspd:stats:total');
    await kv.incr(`lspd:stats:${today}`);
    await kv.lpush(
      `lspd:history:${user.id}`,
      JSON.stringify({
        type: 'appeal',
        title: 'Обжалование наказания',
        date: new Date().toISOString(),
        id: Date.now().toString(36),
      })
    );
    await kv.ltrim(`lspd:history:${user.id}`, 0, 49);

    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
