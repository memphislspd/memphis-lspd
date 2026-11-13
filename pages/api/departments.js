// pages/api/departments.js
import { kv } from '@vercel/kv';
import { verifyToken } from '../../lib/discord';
import { hasAdminAccess } from '../../lib/admins';
import { mutateJsonArray } from '../../lib/kv-atomic';

export default async function handler(req, res) {
  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // GET: Получить все отделы
  if (req.method === 'GET') {
    try {
      const departments = await kv.get('lspd:departments_roster') || [];
      return res.status(200).json(departments);
    } catch (e) {
      return res.status(500).json({ error: 'Ошибка БД' });
    }
  }

  // POST: Добавить отдел
  if (req.method === 'POST') {
    if (!(await hasAdminAccess(user))) return res.status(403).json({ error: 'Нет доступа' });
    const { name, icon, description, leaders } = req.body;
    if (!name || !description) return res.status(400).json({ error: 'Заполните обязательные поля' });

    try {
      const departments = await mutateJsonArray('lspd:departments_roster', 'add', { id: Date.now().toString(), name, icon: icon || '🏢', description, leaders: leaders || [] });
      return res.status(200).json({ success: true, departments });
    } catch (e) {
      return res.status(500).json({ error: 'Ошибка сохранения' });
    }
  }

  // PUT: Обновить существующий отдел
  if (req.method === 'PUT') {
    if (!(await hasAdminAccess(user))) return res.status(403).json({ error: 'Нет доступа' });
    const { id, name, icon, description, leaders } = req.body;
    
    try {
      const current = await kv.get('lspd:departments_roster') || [];
      const existing = current.find(d => d.id === id);
      if (!existing) return res.status(404).json({ error: 'Отдел не найден' });
      const departments = await mutateJsonArray('lspd:departments_roster', 'update', { ...existing, name, icon: icon || '🏢', description, leaders: leaders || [] });
      return res.status(200).json({ success: true, departments });
    } catch (e) {
      return res.status(500).json({ error: 'Ошибка обновления' });
    }
  }

  // DELETE: Удалить отдел
  if (req.method === 'DELETE') {
    if (!(await hasAdminAccess(user))) return res.status(403).json({ error: 'Нет доступа' });
    const { id } = req.body;
    try {
      const departments = await mutateJsonArray('lspd:departments_roster', 'delete', { id });
      return res.status(200).json({ success: true, departments });
    } catch (e) {
      return res.status(500).json({ error: 'Ошибка удаления' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
