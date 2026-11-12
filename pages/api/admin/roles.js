// pages/api/admin/roles.js
import { verifyToken } from '../../../lib/discord';
import { hasAdminAccess } from '../../../lib/admins';
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (!(await hasAdminAccess(user))) return res.status(403).json({ error: 'Нет доступа' });

  const { discordId } = req.query;
  if (!discordId || !/^\d{15,22}$/.test(String(discordId))) {
    return res.status(400).json({ error: 'Укажите корректный Discord ID' });
  }

  const roles = await kv.get('user:roles:' + discordId);
  const info = await kv.get('user:info:' + discordId);

  if (!roles) {
    return res.status(404).json({ error: 'Пользователь не заходил на сайт за последние 7 дней' });
  }

  return res.status(200).json({ roles, info });
}
