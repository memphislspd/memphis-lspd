// pages/api/admin/roles.js
import { verifyToken } from '../../../lib/discord';
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { discordId } = req.query;
  if (!discordId) return res.status(400).json({ error: 'Укажите ID' });

  const roles = await kv.get(`user:roles:${discordId}`);
  const info = await kv.get(`user:info:${discordId}`);

  if (!roles) {
    return res.status(404).json({ error: 'Пользователь не заходил на сайт за последние 7 дней' });
  }

  res.status(200).json({ roles, info });
}
