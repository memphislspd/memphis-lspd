// pages/api/staff.js
import { kv } from '@vercel/kv';
import { verifyToken } from '../../lib/discord';

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

  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // POST: Добавить нового человека (только для админов)
  if (req.method === 'POST') {
    // Тут можно добавить проверку на роль, но пока пустим всех, у кого есть доступ к админке
    const { name, rank, discord, avatar } = req.body;

    if (!name || !rank || !discord) {
      return res.status(400).json({ error: 'Заполните все поля' });
    }

    try {
      const staff = await kv.get('lspd:staff_roster') || [];
      
      const newMember = {
        id: Date.now().toString(), // Уникальный ID
        name,
        rank,
        discord,
        avatar: avatar || '', // Если аватарки нет, будет пусто
      };

      staff.push(newMember);
      await kv.set('lspd:staff_roster', staff);

      return res.status(200).json({ success: true, staff });
    } catch (e) {
      return res.status(500).json({ error: 'Ошибка сохранения' });
    }
  }

  // DELETE: Удалить человека
  if (req.method === 'DELETE') {
    const { id } = req.body;
    try {
      let staff = await kv.get('lspd:staff_roster') || [];
      staff = staff.filter(s => s.id !== id);
      await kv.set('lspd:staff_roster', staff);
      return res.status(200).json({ success: true, staff });
    } catch (e) {
      return res.status(500).json({ error: 'Ошибка удаления' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
