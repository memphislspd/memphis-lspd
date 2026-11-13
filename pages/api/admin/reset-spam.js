import { verifyToken } from '../../../lib/discord';
import { hasAdminAccess } from '../../../lib/admins';
import { resetSpam } from '../../../lib/antispam';
import { logAdminAction } from '../../../lib/admin-audit';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyToken(req.cookies.token);
  
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (!(await hasAdminAccess(user))) return res.status(403).json({ error: 'Нет доступа' });

  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'Укажите Discord ID' });
  }

  await resetSpam(userId);
  await logAdminAction(user, { action: 'antispam.user_reset', description: 'Сбросил спам-лимит пользователя', targetId: userId });
  
  res.status(200).json({ success: true, message: `Спам-лимит для ${userId} сброшен!` });
}
