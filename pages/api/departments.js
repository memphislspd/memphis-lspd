// pages/api/departments.js
import { kv } from '@vercel/kv';
import { verifyToken } from '../../lib/discord';
import { isAdmin } from '../../lib/admins';

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

  // POST: Добавить отдел (только для админов)
  if (req.method === 'POST') {
    if (!isAdmin(user.id)) return res.status(403).json({ error: 'Нет доступа' });

    const { name, icon, description, leaders } = req.body;
    if (!name || !description) return res.status(400).json({ error: 'Заполните обязательные поля' });

    try {
      const departments = await kv.get('lspd:departments_roster') || [];
      
      const newDept = {
        id: Date.now().toString(),
        name,
        icon: icon || '🏢',
        description,
        leaders: leaders || [] // массив объектов { name, rank }
      };

      departments.push(newDept);
      await kv.set('lspd:departments_roster', departments);

      return res.status(200).json({ success: true, departments });
    } catch (e) {
      return res.status(500).json({ error: 'Ошибка сохранения' });
    }
  }

  // DELETE: Удалить отдел
  if (req.method === 'DELETE') {
    if (!isAdmin(user.id)) return res.status(403).json({ error: 'Нет доступа' });
    
    const { id } = req.body;
    try {
      let departments = await kv.get('lspd:departments_roster') || [];
      departments = departments.filter(d => d.id !== id);
      await kv.set('lspd:departments_roster', departments);
      return res.status(200).json({ success: true, departments });
    } catch (e) {
      return res.status(500).json({ error: 'Ошибка удаления' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
