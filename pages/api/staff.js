// pages/api/staff.js
import { kv } from '@vercel/kv';
import { verifyToken } from '../../lib/discord';
import { isAdmin } from '../../lib/admins';

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

  // Изменение состава доступно только администраторам.
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyToken(req.cookies.token);
  if (!user || !isAdmin(user.id)) {
    return res.status(403).json({ error: 'Нет доступа' });
  }

  // POST: Добавить нового человека.
  if (req.method === 'POST') {
    const { name, rank, discord, avatar } = req.body || {};

    if (!name || !rank || !discord) {
      return res.status(400).json({ error: 'Заполните все поля' });
    }

    try {
      const staff = await kv.get('lspd:staff_roster') || [];

      const newMember = {
        id: Date.now().toString(),
        name,
        rank,
        discord,
        avatar: avatar || '',
      };

      staff.push(newMember);
      await kv.set('lspd:staff_roster', staff);

      return res.status(200).json({ success: true, staff });
    } catch (e) {
      return res.status(500).json({ error: 'Ошибка сохранения' });
    }
  }

  // DELETE: Удалить человека.
  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (typeof id !== 'string' || !id.trim()) {
      return res.status(400).json({ error: 'Укажите ID записи' });
    }

    try {
      let staff = await kv.get('lspd:staff_roster') || [];
      staff = staff.filter(s => s.id !== id);
      await kv.set('lspd:staff_roster', staff);
      return res.status(200).json({ success: true, staff });
    } catch (e) {
      return res.status(500).json({ error: 'Ошибка удаления' });
    }
  }
}
