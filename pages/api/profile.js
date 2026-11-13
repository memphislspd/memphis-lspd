import { verifyToken } from '../../lib/discord';
import { kv } from '@vercel/kv';

function isObjectRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeProfile(value) {
  let candidate = value;
  if (typeof candidate === 'string') {
    try { candidate = JSON.parse(candidate); } catch { candidate = null; }
  }
  if (!isObjectRecord(candidate)) return { fullName: '', department: '' };
  return {
    fullName: typeof candidate.fullName === 'string' ? candidate.fullName.slice(0, 120) : '',
    department: typeof candidate.department === 'string' ? candidate.department.slice(0, 32) : ''
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const key = `lscsd:profile:${user.id}`;

  if (req.method === 'GET') {
    try {
      const profile = normalizeProfile(await kv.get(key));
      return res.status(200).json({ profile });
    } catch (error) {
      console.error('Profile GET error:', error);
      return res.status(503).json({ error: 'Не удалось загрузить данные профиля. Попробуйте позже.' });
    }
  }

  if (req.method === 'POST') {
    const body = req.body;
    if (!isObjectRecord(body)) {
      return res.status(400).json({ error: 'Некорректные данные профиля' });
    }

    const hasFullName = Object.prototype.hasOwnProperty.call(body, 'fullName');
    const hasDepartment = Object.prototype.hasOwnProperty.call(body, 'department');
    if (!hasFullName && !hasDepartment) {
      return res.status(400).json({ error: 'Нет данных для обновления' });
    }
    if (hasFullName && (typeof body.fullName !== 'string' || body.fullName.length > 120)) {
      return res.status(400).json({ error: 'Имя должно содержать не более 120 символов' });
    }
    if (hasDepartment && (typeof body.department !== 'string' || body.department.length > 32)) {
      return res.status(400).json({ error: 'Некорректное название отдела' });
    }

    try {
      const profile = normalizeProfile(await kv.get(key));
      if (hasFullName) profile.fullName = body.fullName.trim();
      if (hasDepartment) profile.department = body.department.trim();

      await kv.set(key, profile);
      return res.status(200).json({ success: true, profile });
    } catch (error) {
      console.error('Profile POST error:', error);
      return res.status(500).json({ error: 'Не удалось сохранить данные профиля' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
