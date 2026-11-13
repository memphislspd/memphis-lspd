import { verifyToken } from '../../../lib/discord';
import { hasAdminAccess, isSuperAdmin } from '../../../lib/admins';
import { kv } from '@vercel/kv';

const ADMIN_AUDIT_KEY = 'lspd:audit:admin_actions';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('Cache-Control', 'no-store, max-age=0');
  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // The owner ID is checked on the server; admin roles alone never grant access.
  if (!isSuperAdmin(user) || !(await hasAdminAccess(user))) {
    return res.status(403).json({ error: 'Только владелец супер-админки может просматривать журнал' });
  }

  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50;
    const requestedOffset = Number.parseInt(req.query.offset, 10);
    const offset = Number.isFinite(requestedOffset) ? Math.max(requestedOffset, 0) : 0;
    const entries = await kv.lrange(ADMIN_AUDIT_KEY, offset, offset + limit - 1);
    const logs = (Array.isArray(entries) ? entries : []).map(entry => {
      try { return typeof entry === 'string' ? JSON.parse(entry) : entry; }
      catch { return null; }
    }).filter(Boolean);
    return res.status(200).json({ logs, limit, offset, hasMore: logs.length === limit });
  } catch (error) {
    console.error('Admin audit log read failed:', error);
    return res.status(500).json({ error: 'Не удалось загрузить журнал действий' });
  }
}
