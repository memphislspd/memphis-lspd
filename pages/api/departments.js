// pages/api/departments.js
import { kv } from '@vercel/kv';
import { verifyToken } from '../../lib/discord';

const ADMIN_ROLE_IDS = [
  '1514608894700159142', '1514608894700159145', 
  '1514608894700159143', '1550848894789885962', '1514665211980939314'
];
const SUPER_ADMIN_ID = '200102286473691139';

export default async function handler(req, res) {
  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // Универсальная проверка: либо Супер-Админ, либо есть роль
  const hasRole = (user.roles || []).some(r => ADMIN_ROLE_IDS.includes(r));
  const isAdminUser = user.id === SUPER_ADMIN_ID || hasRole;

  // GET: Получить все отделы (доступно всем)
  if (req.method === 'GET') {
    try {
      const departments = await kv.get('lspd:departments_roster') || [];
      return res.status(200).json(departments);
    } catch (e) {
      return res.status(500).json({ error: 'Ошибка БД' });
    }
  }

  // POST: Добавить отдел (только для админов и супер-админа)
  if (req.method === 'POST') {
    if (!isAdminUser) return res.status(403).json({ error: 'Нет доступа' });

    const { name, icon, description, leaders } = req.body;
    if (!name || !description) return res.status(400).json({ error: 'Заполните обязательные поля' });

    try {
      const departments = await kv.get('lspd:departments_roster') || [];
      
      const newDept = {
        id: Date.now().toString(),
        name,
        icon: icon || '🏢',
        description,
        leaders: leaders || []
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
    if (!isAdminUser) return res.status(403).json({ error: 'Нет доступа' });
    
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
