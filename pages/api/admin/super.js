import { verifyToken } from '../../../lib/discord';
import { isSuperAdmin, hasAdminAccess } from '../../../lib/admins';
import { kv } from '@vercel/kv';

const MANUAL_ADMINS_KEY = 'lspd:manual_admins';
const DENIED_ADMINS_KEY = 'lspd:admin_denied_ids';
const validId = value => /^\d{15,22}$/.test(String(value || ''));

export default async function handler(req, res) {
  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (!isSuperAdmin(user) || !(await hasAdminAccess(user))) return res.status(403).json({ error: 'Только активный супер-администратор может управлять этим' });

  try {
    if (req.method === 'GET') {
      const [admins, denied] = await Promise.all([
        kv.get(MANUAL_ADMINS_KEY), kv.smembers(DENIED_ADMINS_KEY)
      ]);
      return res.status(200).json({
        admins: Array.isArray(admins) ? admins : [],
        denied: Array.isArray(denied) ? denied.map(String) : []
      });
    }

    const { discordId } = req.body || {};
    if (!validId(discordId)) return res.status(400).json({ error: 'Неверный Discord ID' });
    const id = String(discordId);

    if (req.method === 'POST') {
      await kv.srem(DENIED_ADMINS_KEY, id);
      const current = await kv.get(MANUAL_ADMINS_KEY);
      const admins = Array.isArray(current) ? current : [];
      if (!admins.includes(id)) {
        admins.push(id);
        await kv.set(MANUAL_ADMINS_KEY, admins);
      }
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const current = await kv.get(MANUAL_ADMINS_KEY);
      const admins = Array.isArray(current) ? current : [];
      await kv.set(MANUAL_ADMINS_KEY, admins.filter(value => String(value) !== id));
      return res.status(200).json({ success: true });
    }

    if (req.method === 'PUT') {
      await kv.sadd(DENIED_ADMINS_KEY, id);
      const current = await kv.get(MANUAL_ADMINS_KEY);
      const admins = Array.isArray(current) ? current : [];
      await kv.set(MANUAL_ADMINS_KEY, admins.filter(value => String(value) !== id));
      return res.status(200).json({ success: true });
    }

    if (req.method === 'PATCH') {
      await kv.srem(DENIED_ADMINS_KEY, id);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Super admin management failed:', error);
    return res.status(500).json({ error: 'Не удалось обновить список администраторов' });
  }
}
