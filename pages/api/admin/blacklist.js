import { verifyToken } from '../../../lib/discord';
import { hasAdminAccess } from '../../../lib/admins';
import { getBlacklist, removeFromBlacklist, addToBlacklist } from '../../../lib/blacklist';
import { logAdminAction } from '../../../lib/admin-audit';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (!(await hasAdminAccess(user))) return res.status(403).json({ error: 'Нет доступа' });

  if (req.method === 'GET') {
    const list = await getBlacklist();
    return res.status(200).json({ blacklist: list });
  }

  if (req.method === 'POST') {
    const { action, userId, username, reason } = req.body;
    
    if (action === 'unban') {
      await removeFromBlacklist(userId);
      await logAdminAction(user, { action: 'blacklist.remove', description: 'Снял блокировку пользователя', targetId: userId });
      return res.status(200).json({ success: true, message: 'Разбанен' });
    }
    
    if (action === 'ban') {
      await addToBlacklist(userId, username || 'Неизвестный', reason || 'Ручной бан');
      await logAdminAction(user, { action: 'blacklist.add', description: 'Добавил пользователя в чёрный список', targetId: userId, targetName: username || null });
      return res.status(200).json({ success: true, message: 'Забанен' });
    }
    
    return res.status(400).json({ error: 'Неизвестное действие' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
