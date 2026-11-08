// pages/api/admin/reset-global-lock.js
import { verifyToken } from '../../../lib/discord';
import { kv } from '@vercel/kv';

const ADMIN_ROLE_IDS = ['1514608894700159142', '1514608894700159145', '1514608894700159143', '1550848894789885962', '1514665211980939314'];
const SUPER_ADMIN_ID = '200102286473691139';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const hasRole = (user.roles || []).some(r => ADMIN_ROLE_IDS.includes(r));
  if (user.id !== SUPER_ADMIN_ID && !hasRole) return res.status(403).json({ error: 'Нет доступа' });

  try {
    // Удаляем ключи, которые ставит антиспам
    await kv.del('lspd:global:locked');
    await kv.del('lspd:global:requests');
    
    return res.status(200).json({ success: true, message: 'Сайт разблокирован. Все лимиты сброшены.' });
  } catch (e) {
    return res.status(500).json({ error: 'Ошибка базы данных' });
  }
}
