import { verifyToken } from '../../lib/discord';
import { kv } from '@vercel/kv';
import { recordSubmissionHistory } from '../../lib/submission-history';
import { checkFormRateLimit, isBoundedText, isHttpsUrl } from '../../lib/form-security';

const WEBHOOK_URL = process.env.WEBHOOK_RECOVERY;
const ROLE_PING = '1514608894679191592';
const STAFF_ROLE_ID = '1552313180041121802';

async function rejectRecovery(res, user, statusCode, message) {
  await recordSubmissionHistory(user.id, { type: 'recovery', title: 'Отработка взыскания', status: 'not_sent' });
  return res.status(statusCode).json({ error: message });
}

const MP_LABELS = {
  drop: 'Дроп',
  supply: 'Поставка/крафт',
  bank: 'Отбитие бизнеса/банка',
  dept_mp: 'МП от отдела',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (!Array.isArray(user.roles) || !user.roles.includes(STAFF_ROLE_ID)) {
    return rejectRecovery(res, user, 403, 'Для подачи этой формы требуется роль сотрудника LSPD');
  }
  let rateAllowed;
  try {
    rateAllowed = await checkFormRateLimit(user.id, 'recovery', 3, 900);
  } catch (error) {
    console.error('recovery rate-limit storage failed:', error);
    return res.status(503).json({ error: 'Защита формы временно недоступна. Попробуйте позже.' });
  }
  if (!rateAllowed) return res.status(429).json({ error: 'Слишком много отправок. Повторите через 15 минут.' });


  const { warn, rank, method, suppliesProof, mpList, comment } = req.body;

  if (!isBoundedText(warn, 120) || !['cadet', 'regular'].includes(rank) ||
      !['supplies', 'points'].includes(method) || !isBoundedText(comment, 900, { optional: true })) {
    return rejectRecovery(res, user, 400, 'Проверьте обязательные поля и допустимые значения.');
  }
  if (method === 'supplies' && (!isBoundedText(suppliesProof, 2048) || !isHttpsUrl(suppliesProof))) {
    return rejectRecovery(res, user, 400, 'Добавьте корректную HTTPS-ссылку на скриншот склада.');
  }
  if (method === 'points') {
    if (!Array.isArray(mpList) || mpList.length === 0 || mpList.length > 15) {
      return rejectRecovery(res, user, 400, 'Добавьте от 1 до 15 МП.');
    }
    for (const mp of mpList) {
      if (!mp || !['drop', 'supply', 'bank', 'dept_mp'].includes(mp.type) ||
          !isBoundedText(mp.proof, 2048) || !isHttpsUrl(mp.proof)) {
        return rejectRecovery(res, user, 400, 'Каждое МП должно содержать допустимый тип и корректную HTTPS-ссылку.');
      }
    }
  }

  if (!WEBHOOK_URL) {
    return rejectRecovery(res, user, 500, 'Вебхук не настроен');
  }

  const fields = [
    { name: '👤 Сотрудник', value: `<@${user.id}>`, inline: true },
    { name: '🆔 Discord ID', value: user.id, inline: true },
    { name: '⚠️ Взыскание', value: warn, inline: true },
    { name: '🎖️ Ранг', value: rank === 'cadet' ? 'Кадет (1–2 ранг)' : 'Обычный сотрудник', inline: true },
    { name: '🛠️ Способ', value: method === 'supplies' ? 'Бинты+Капсулы' : 'Баллы (МП)', inline: true },
  ];

  if (method === 'supplies') {
    fields.push({ name: '📸 Скриншот склада', value: suppliesProof, inline: false });
  } else {
    mpList.forEach((mp, i) => {
      const label = MP_LABELS[mp.type] || mp.type;
      fields.push({
        name: `🎯 МП #${i + 1} — ${label}`,
        value: mp.proof,
        inline: false,
      });
    });
  }

  if (comment) {
    fields.push({ name: '💬 Комментарий', value: comment, inline: false });
  }

  const embed = {
    title: '⚖️ Заявка на отработку взыскания',
    color: 0xF44336,
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
    return rejectRecovery(res, user, 400, 'Слишком много текста или приложений для одного сообщения Discord. Сократите доказательства и комментарий.');
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
      return rejectRecovery(res, user, 502, `Discord: ${errText}`);
    }

    await recordSubmissionHistory(user.id, { type: 'recovery', title: 'Отработка взыскания', status: 'sent' });
    try {
      const today = new Date().toISOString().split('T')[0];
      await kv.incr('lspd:stats:total');
      await kv.incr(`lspd:stats:${today}`);
    } catch (storageError) {
      console.error('Recovery delivered to Discord, but stats storage failed:', storageError);
    }
    return res.status(200).json({ success: true });
  } catch (e) {
    await rejectRecovery(res, user, 502, e.message || 'Не удалось отправить заявку');
  }
}
