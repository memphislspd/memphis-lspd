// pages/api/admin/roles.js
import { verifyToken } from '../../../lib/discord';
import { isAdmin } from '../../../lib/admins';
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyToken(req.cookies.token);
  if (!user || !isAdmin(user.id)) {
    return res.status(403).json({ error: 'Нет доступа' });
  }

  const { discordId } = req.query;
  if (typeof discordId !== 'string' || !/^\d{17,20}$/.test(discordId)) {
    return res.status(400).json({ error: 'Укажите корректный Discord ID' });
  }

  try {
    const roles = await kv.get(`user:roles:${discordId}`);
    const info = await kv.get(`user:info:${discordId}`);

    if (!roles) {
      return res.status(404).json({ error: 'Пользователь не заходил на сайт за последние 7 дней' });
    }

    return res.status(200).json({ roles, info: info || null });
  } catch (error) {
    console.error('Admin roles lookup error:', error);
    return res.status(500).json({ error: 'Ошибка загрузки данных' });
  }
}
