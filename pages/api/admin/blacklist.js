import { verifyToken } from '../../../lib/discord';
import { hasAdminAccess } from '../../../lib/admins';
import { getBlacklist, removeFromBlacklist, addToBlacklist } from '../../../lib/blacklist';
import { logAdminAction } from '../../../lib/admin-audit';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store, max-age=0');
  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (!(await hasAdminAccess(user))) return res.status(403).json({ error: 'Нет доступа' });

  try {
    if (req.method === 'GET') {
      const list = await getBlacklist();
      return res.status(200).json({ blacklist: list });
    }

    const { action, userId, username, reason } = req.body || {};
    if (!/^\\d{15,22}$/.test(String(userId || ''))) {
      return res.status(400).json({ error: 'Укажите корректный Discord ID' });
    }
    if (action !== 'ban' && action !== 'unban') {
      return res.status(400).json({ error: 'Неизвестное действие' });
    }
    if (username !== undefined && (typeof username !== 'string' || username.length > 100)) {
      return res.status(400).json({ error: 'Имя пользователя слишком длинное или имеет неверный формат' });
    }
    if (reason !== undefined && (typeof reason !== 'string' || reason.length > 500)) {
      return res.status(400).json({ error: 'Причина блокировки слишком длинная или имеет неверный формат' });
    }

    if (action === 'unban') {
      await removeFromBlacklist(String(userId));
      await logAdminAction(user, { action: 'blacklist.remove', description: 'Снял блокировку пользователя', targetId: userId });
      return res.status(200).json({ success: true, message: 'Разбанен' });
    }

    const safeUsername = username?.trim() || 'Неизвестный';
    const safeReason = reason?.trim() || 'Ручной бан';
    await addToBlacklist(String(userId), safeUsername, safeReason);
    await logAdminAction(user, {
      action: 'blacklist.add',
      description: 'Добавил пользователя в чёрный список',
      targetId: userId,
      targetName: safeUsername
    });
    return res.status(200).json({ success: true, message: 'Забанен' });
  } catch (error) {
    console.error('Blacklist operation failed:', error);
    return res.status(500).json({ error: 'Не удалось выполнить операцию с чёрным списком' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
