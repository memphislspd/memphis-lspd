import { verifyToken } from '../../lib/discord';
import { kv } from '@vercel/kv';
import { recordSubmissionHistory } from '../../lib/submission-history';

const WEBHOOK_URL = process.env.WEBHOOK_RECOVERY;
const ROLE_PING = '1514608894679191592';
const STAFF_ROLE_ID = '1552313180041121802';

async function rejectAppeal(res, user, statusCode, message) {
  await recordSubmissionHistory(user.id, { type: 'appeal', title: 'Обжалование наказания', status: 'not_sent' });
  return res.status(statusCode).json({ error: message });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (!Array.isArray(user.roles) || !user.roles.includes(STAFF_ROLE_ID)) {
    return rejectAppeal(res, user, 403, 'Для подачи этой формы требуется роль сотрудника LSPD');
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
    return rejectAppeal(res, user, 400, 'Заполните обязательные поля');
  }

  if (!WEBHOOK_URL) {
    return rejectAppeal(res, user, 500, 'Вебхук не настроен');
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
  const embedTextLength = (embed.title || '').length +
    (embed.footer?.text || '').length +
    (embed.author?.name || '').length +
    fields.reduce((total, field) => total + field.name.length + field.value.length, 0);
  if (fields.length > 25 || fields.some(field => field.value.length > 1024) || embedTextLength > 6000) {
    return rejectAppeal(res, user, 400, 'Слишком много текста или приложений для одного сообщения Discord. Сократите доказательства и комментарий.');
  }


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
      return rejectAppeal(res, user, 502, `Discord: ${errText}`);
    }

    await recordSubmissionHistory(user.id, { type: 'appeal', title: 'Обжалование наказания', status: 'sent' });
    try {
      const today = new Date().toISOString().split('T')[0];
      await kv.incr('lspd:stats:total');
      await kv.incr(`lspd:stats:${today}`);
    } catch (storageError) {
      console.error('Appeal delivered to Discord, but stats storage failed:', storageError);
    }
    return res.status(200).json({ success: true });
  } catch (e) {
    await rejectAppeal(res, user, 502, e.message || 'Не удалось отправить заявку');
  }
}
