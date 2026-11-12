// pages/api/admin/reset-global-lock.js
import { verifyToken } from '../../../lib/discord';
import { hasAdminAccess } from '../../../lib/admins';
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (!(await hasAdminAccess(user))) return res.status(403).json({ error: 'Нет доступа' });

  try {
    await kv.del('lspd:global:locked');
    await kv.del('lspd:global:requests');

    return res.status(200).json({ success: true, message: 'Сайт разблокирован. Все лимиты сброшены.' });
  } catch (error) {
    console.error('Global unlock error:', error);
    return res.status(500).json({ error: 'Ошибка базы данных' });
  }
}
