// pages/api/staff.js
import { kv } from '@vercel/kv';
import { verifyToken } from '../../lib/discord';
import { hasAdminAccess } from '../../lib/admins';
import { mutateJsonArray } from '../../lib/kv-atomic';
import { logAdminAction } from '../../lib/admin-audit';

export default async function handler(req, res) {
  // GET используется публичной секцией руководства на стартовой странице.
  if (req.method === 'GET') {
    try {
      const staff = await kv.get('lspd:staff_roster') || [];
      return res.status(200).json(staff);
    } catch (e) {
      return res.status(500).json({ error: 'Ошибка БД' });
    }
  }

  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (!(await hasAdminAccess(user))) return res.status(403).json({ error: 'Нет доступа' });

  // POST: Добавить нового человека (только для админов)
  if (req.method === 'POST') {
    const { name, rank, discord, avatar } = req.body;

    if (!name || !rank || !discord) {
      return res.status(400).json({ error: 'Заполните все поля' });
    }

    try {
      const member = { id: Date.now().toString(), name, rank, discord, avatar: avatar || '' };
      const staff = await mutateJsonArray('lspd:staff_roster', 'add', member);
      await logAdminAction(user, { action: 'staff.create', description: 'Добавил сотрудника в реестр', targetId: member.id, targetName: name });

      return res.status(200).json({ success: true, staff });
    } catch (e) {
      return res.status(500).json({ error: 'Ошибка сохранения' });
    }
  }

  // DELETE: Удалить человека
  if (req.method === 'DELETE') {
    const { id } = req.body;
    try {
      const current = await kv.get('lspd:staff_roster') || [];
      const member = current.find(item => String(item.id) === String(id));
      const staff = await mutateJsonArray('lspd:staff_roster', 'delete', { id });
      await logAdminAction(user, { action: 'staff.delete', description: 'Удалил сотрудника из реестра', targetId: id, targetName: member?.name || null });
      return res.status(200).json({ success: true, staff });
    } catch (e) {
      return res.status(500).json({ error: 'Ошибка удаления' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
