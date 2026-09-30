import { verifyToken } from '../../../lib/discord';
import { isAdmin } from '../../../lib/admins';
import { getBlacklist, removeFromBlacklist, addToBlacklist } from '../../../lib/blacklist';

export default async function handler(req, res) {
  const user = verifyToken(req.cookies.token);
  
  if (!user || !isAdmin(user.id)) {
    return res.status(403).json({ error: 'Нет доступа' });
  }

  if (req.method === 'GET') {
    const list = await getBlacklist();
    return res.status(200).json({ blacklist: list });
  }

  if (req.method === 'POST') {
    const { action, userId, username, reason } = req.body;
    
    if (action === 'unban') {
      await removeFromBlacklist(userId);
      return res.status(200).json({ success: true, message: 'Разбанен' });
    }
    
    if (action === 'ban') {
      await addToBlacklist(userId, username || 'Неизвестный', reason || 'Ручной бан');
      return res.status(200).json({ success: true, message: 'Забанен' });
    }
    
    return res.status(400).json({ error: 'Неизвестное действие' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
