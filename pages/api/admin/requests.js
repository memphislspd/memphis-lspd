import { verifyToken } from '../../../lib/discord';
import { isAdmin } from '../../../lib/admins';
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const user = verifyToken(req.cookies.token);
  
  if (!user || !isAdmin(user.id)) {
    return res.status(403).json({ error: 'Нет доступа' });
  }

  // GET — получить список заявок
  if (req.method === 'GET') {
    try {
      const all = await kv.lrange('lspd:submissions:all', 0, 199);
      const submissions = all.map(item => {
        try { return typeof item === 'string' ? JSON.parse(item) : item; }
        catch { return null; }
      }).filter(Boolean);

      const now = Date.now();
      const processed = submissions.map(s => ({
        ...s,
        ageHours: Math.floor((now - new Date(s.date).getTime()) / 3600000),
        isOld: (now - new Date(s.date).getTime()) > 24 * 3600000
      }));

      res.status(200).json({ submissions: processed });
    } catch (error) {
      console.error('Requests error:', error);
      res.status(500).json({ error: 'Ошибка загрузки' });
    }
    return;
  }

  // POST — пометить обработанной
  if (req.method === 'POST') {
    const { id, action } = req.body;
    
    if (action === 'process') {
      // Читаем всю историю, обновляем одну запись, сохраняем обратно
      const all = await kv.lrange('lspd:submissions:all', 0, 199);
      const updated = all.map(item => {
        try {
          const parsed = typeof item === 'string' ? JSON.parse(item) : item;
          if (parsed.id === id) parsed.processed = true;
          return JSON.stringify(parsed);
        } catch {
          return item;
        }
      });

      await kv.del('lspd:submissions:all');
      // Восстанавливаем в обратном порядке (LPUSH добавляет в начало)
      for (let i = updated.length - 1; i >= 0; i--) {
        await kv.rpush('lspd:submissions:all', updated[i]);
      }

      res.status(200).json({ success: true });
      return;
    }

    res.status(400).json({ error: 'Неизвестное действие' });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
