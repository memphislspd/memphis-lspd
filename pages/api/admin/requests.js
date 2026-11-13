import { verifyToken } from '../../../lib/discord';
import { hasAdminAccess } from '../../../lib/admins';
import { kv } from '@vercel/kv';
import { markSubmissionProcessed } from '../../../lib/kv-atomic';
import { logAdminAction } from '../../../lib/admin-audit';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (!(await hasAdminAccess(user))) return res.status(403).json({ error: 'Нет доступа' });

  // GET — получить список заявок
  if (req.method === 'GET') {
    try {
      const all = await kv.lrange('lspd:submissions:all', 0, 199);
      const submissions = all.map(item => {
        try { return typeof item === 'string' ? JSON.parse(item) : item; }
        catch { return null; }
      }).filter(Boolean);

      const now = Date.now();
      const processed = submissions.map(s => ({
        ...s,
        ageHours: Math.floor((now - new Date(s.date).getTime()) / 3600000),
        isOld: (now - new Date(s.date).getTime()) > 24 * 3600000
      }));

      res.status(200).json({ submissions: processed });
    } catch (error) {
      console.error('Requests error:', error);
      res.status(500).json({ error: 'Ошибка загрузки' });
    }
    return;
  }

  // POST — пометить обработанной
  if (req.method === 'POST') {
    const { id, action } = req.body;
    
    if (action === 'process') {
      await markSubmissionProcessed(id);
      await logAdminAction(user, { action: 'submission.process', description: 'Отметил заявку обработанной', targetId: id });

      res.status(200).json({ success: true });
      return;
    }

    res.status(400).json({ error: 'Неизвестное действие' });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
