import { verifyToken } from '../../lib/discord';
import { kv } from '@vercel/kv';

const WEBHOOK_URL = process.env.WEBHOOK_RECOVERY;

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
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { warn, rank, method, suppliesProof, mpList, comment } = req.body;

  if (!warn || !rank || !method) {
    return res.status(400).json({ error: 'Заполните обязательные поля' });
  }
  if (method === 'supplies' && !suppliesProof) {
    return res.status(400).json({ error: 'Нужен скриншот склада' });
  }
  if (method === 'points') {
    if (!Array.isArray(mpList) || mpList.length === 0) {
      return res.status(400).json({ error: 'Добавьте хотя бы одно МП' });
    }
    for (const mp of mpList) {
      if (!mp.type || !mp.proof) {
        return res.status(400).json({ error: 'Заполните все МП' });
      }
    }
  }

  if (!WEBHOOK_URL) {
    return res.status(500).json({ error: 'Вебхук не настроен' });
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

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `<@${user.id}>`,
        embeds: [embed],
        username: 'LSPD Forms',
        avatar_url: 'https://i.imgur.com/AfFp7pu.png',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: `Discord: ${errText}` });
    }

    // Статистика и история
    const today = new Date().toISOString().split('T')[0];
    await kv.incr('lspd:stats:total');
    await kv.incr(`lspd:stats:${today}`);
    await kv.lpush(
      `lspd:history:${user.id}`,
      JSON.stringify({
        type: 'recovery',
        title: 'Отработка взыскания',
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
