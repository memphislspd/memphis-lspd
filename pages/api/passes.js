
import { kv } from '@vercel/kv';
import { verifyToken } from '../../lib/discord';
import { hasAdminAccess } from '../../lib/admins';
import { mutateJsonArray } from '../../lib/kv-atomic';
import { logAdminAction } from '../../lib/admin-audit';

export default async function handler(req, res) {
  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // GET
  if (req.method === 'GET') {
    const passes = await kv.get('lspd:passes') || [];
    return res.status(200).json(passes);
  }

  // POST
  if (req.method === 'POST') {
    if (!(await hasAdminAccess(user))) return res.status(403).json({ error: 'Нет доступа' });
    const { name, staticId, passNumber, issueDate, link } = req.body;
    
    if (!name || !staticId || !passNumber || !issueDate) return res.status(400).json({ error: 'Заполните обязательные поля' });
    
    const pass = { id: Date.now().toString(), name, staticId, passNumber, issueDate, link: link || '' };
    const passes = await mutateJsonArray('lspd:passes', 'add', pass);
    await logAdminAction(user, { action: 'pass.create', description: 'Добавил пропуск', targetId: pass.id, targetName: name });
    
    return res.status(200).json(passes);
  }

  // DELETE
  if (req.method === 'DELETE') {
    if (!(await hasAdminAccess(user))) return res.status(403).json({ error: 'Нет доступа' });
    const { id } = req.body;
    
    const current = await kv.get('lspd:passes') || [];
    const pass = current.find(item => String(item.id) === String(id));
    const passes = await mutateJsonArray('lspd:passes', 'delete', { id });
    await logAdminAction(user, { action: 'pass.delete', description: 'Удалил пропуск', targetId: id, targetName: pass?.name || null });
    
    return res.status(200).json(passes);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
