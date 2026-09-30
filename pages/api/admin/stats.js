import { verifyToken } from '../../../lib/discord';
import { isAdmin } from '../../../lib/admins';
import { kv } from '@vercel/kv';
import { getBlacklist } from '../../../lib/blacklist';

export default async function handler(req, res) {
  const user = verifyToken(req.cookies.token);
  
  if (!user || !isAdmin(user.id)) {
    return res.status(403).json({ error: 'Нет доступа' });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const [total, todayCount, blacklist] = await Promise.all([
      kv.get('lspd:stats:total') || 0,
      kv.get(`lspd:stats:${today}`) || 0,
      getBlacklist()
    ]);

    const isLocked = await kv.get('lspd:global:locked');
    const lockTtl = isLocked ? await kv.ttl('lspd:global:locked') : 0;

    res.status(200).json({
      total: parseInt(total),
      today: parseInt(todayCount),
      bannedCount: blacklist.length,
      isLocked: !!isLocked,
      lockTtl
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Ошибка загрузки' });
  }
}
