// pages/api/staff.js
import { kv } from '@vercel/kv';
import { verifyToken } from '../../lib/discord';
import { hasAdminAccess } from '../../lib/admins';
import { mutateJsonArray } from '../../lib/kv-atomic';
import { logAdminAction } from '../../lib/admin-audit';

function isValidOptionalImageUrl(value) {
  if (value === undefined || value === null || value === '') return true;
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const staff = await kv.get('lspd:staff_roster') || [];
      return res.status(200).json(Array.isArray(staff) ? staff : []);
    } catch (error) {
      console.error('Staff roster read failed:', error);
      return res.status(500).json({ error: 'Ошибка БД' });
    }
  }

  if (req.method !== 'POST' && req.method !== 'DELETE') {
    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (!(await hasAdminAccess(user))) return res.status(403).json({ error: 'Нет доступа' });

  if (req.method === 'POST') {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({ error: 'Некорректные данные сотрудника' });
    }
    const { name, rank, discord, avatar } = body;
    if (typeof name !== 'string' || !name.trim() || name.length > 100 ||
        typeof rank !== 'string' || !rank.trim() || rank.length > 80 ||
        typeof discord !== 'string' || !discord.trim() || discord.length > 100) {
      return res.status(400).json({ error: 'Проверьте имя, должность и Discord' });
    }
    if (!isValidOptionalImageUrl(avatar)) {
      return res.status(400).json({ error: 'Ссылка на аватар должна быть корректным HTTP(S)-адресом до 2048 символов' });
    }

    try {
      const member = {
        id: Date.now().toString(),
        name: name.trim(),
        rank: rank.trim(),
        discord: discord.trim(),
        avatar: typeof avatar === 'string' ? avatar.trim() : ''
      };
      const staff = await mutateJsonArray('lspd:staff_roster', 'add', member);
      await logAdminAction(user, {
        action: 'staff.create',
        description: 'Добавил сотрудника в реестр',
        targetId: member.id,
        targetName: member.name
      });
      return res.status(201).json({ success: true, staff });
    } catch (error) {
      console.error('Staff creation failed:', error);
      return res.status(500).json({ error: 'Ошибка сохранения' });
    }
  }

  const id = req.body?.id;
  if ((typeof id !== 'string' && typeof id !== 'number') || !String(id).trim() || String(id).length > 64) {
    return res.status(400).json({ error: 'Укажите корректный ID сотрудника' });
  }

  try {
    const current = await kv.get('lspd:staff_roster') || [];
    const member = Array.isArray(current)
      ? current.find(item => String(item.id) === String(id))
      : null;
    if (!member) return res.status(404).json({ error: 'Сотрудник не найден' });

    const staff = await mutateJsonArray('lspd:staff_roster', 'delete', { id: String(id) });
    await logAdminAction(user, {
      action: 'staff.delete',
      description: 'Удалил сотрудника из реестра',
      targetId: id,
      targetName: member.name || null
    });
    return res.status(200).json({ success: true, staff });
  } catch (error) {
    console.error('Staff deletion failed:', error);
    return res.status(500).json({ error: 'Ошибка удаления' });
  }
}
