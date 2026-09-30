import { kv } from '@vercel/kv';
import { verifyToken } from '../../lib/discord';

export default async function handler(req, res) {
  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Формируем массив последних 7 дней
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        label: date.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', ''),
        isToday: dateStr === todayStr
      });
    }

    // Параллельно тянем статистику
    const [total, todayCount, history, ...dailyCounts] = await Promise.all([
      kv.get('lspd:stats:total') || 0,
      kv.get(`lspd:stats:${todayStr}`) || 0,
      kv.lrange(`lspd:history:${user.id}`, 0, 49),
      ...days.map(d => kv.get(`lspd:stats:${d.date}`) || 0)
    ]);

    // Формируем график
    const chart = days.map((day, i) => ({
      label: day.label,
      date: day.date,
      count: parseInt(dailyCounts[i]) || 0,
      isToday: day.isToday
    }));

    // Максимум для шкалы графика
    const maxCount = Math.max(...chart.map(d => d.count), 1);

    res.status(200).json({
      total: parseInt(total),
      today: parseInt(todayCount),
      history: history.map(h => { try { return JSON.parse(h); } catch { return h; } }),
      chart,
      maxCount
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to load stats' });
  }
}
