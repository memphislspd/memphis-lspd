// pages/api/departments.js
import { kv } from '@vercel/kv';
import { verifyToken } from '../../lib/discord';
import { hasAdminAccess } from '../../lib/admins';
import { mutateJsonArray } from '../../lib/kv-atomic';
import { logAdminAction } from '../../lib/admin-audit';

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validateDepartment(body, requireId = false) {
  if (!isRecord(body)) return 'Некорректные данные отдела';
  if (requireId && (typeof body.id !== 'string' && typeof body.id !== 'number')) {
    return 'Укажите корректный ID отдела';
  }
  if (requireId && !String(body.id).trim()) return 'Укажите корректный ID отдела';
  if (requireId && String(body.id).length > 64) return 'Некорректный ID отдела';
  if (typeof body.name !== 'string' || !body.name.trim() || body.name.length > 80) {
    return 'Название отдела обязательно и должно быть не длиннее 80 символов';
  }
  if (typeof body.description !== 'string' || !body.description.trim() || body.description.length > 1000) {
    return 'Описание отдела обязательно и должно быть не длиннее 1000 символов';
  }
  if (body.icon !== undefined && (typeof body.icon !== 'string' || body.icon.length > 32)) {
    return 'Иконка отдела должна быть текстом до 32 символов';
  }
  if (body.leaders !== undefined) {
    if (!Array.isArray(body.leaders) || body.leaders.length > 25) {
      return 'Список руководителей должен содержать не более 25 записей';
    }
    for (const leader of body.leaders) {
      if (!isRecord(leader) ||
          typeof leader.name !== 'string' || !leader.name.trim() || leader.name.length > 120 ||
          typeof leader.rank !== 'string' || !leader.rank.trim() || leader.rank.length > 80) {
        return 'Проверьте имена и должности руководителей';
      }
    }
  }
  return null;
}

export default async function handler(req, res) {
  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      const departments = await kv.get('lspd:departments_roster') || [];
      return res.status(200).json(Array.isArray(departments) ? departments : []);
    } catch (error) {
      console.error('Departments read failed:', error);
      return res.status(500).json({ error: 'Ошибка БД' });
    }
  }

  if (req.method === 'POST') {
    if (!(await hasAdminAccess(user))) return res.status(403).json({ error: 'Нет доступа' });
    const body = req.body || {};
    const validationError = validateDepartment(body);
    if (validationError) return res.status(400).json({ error: validationError });

    try {
      const department = {
        id: Date.now().toString(),
        name: body.name.trim(),
        icon: body.icon?.trim() || '🏢',
        description: body.description.trim(),
        leaders: body.leaders || []
      };
      const departments = await mutateJsonArray('lspd:departments_roster', 'add', department);
      await logAdminAction(user, {
        action: 'department.create',
        description: 'Создал отдел',
        targetId: department.id,
        targetName: department.name
      });
      return res.status(201).json({ success: true, departments });
    } catch (error) {
      console.error('Department creation failed:', error);
      return res.status(500).json({ error: 'Ошибка сохранения' });
    }
  }

  if (req.method === 'PUT') {
    if (!(await hasAdminAccess(user))) return res.status(403).json({ error: 'Нет доступа' });
    const validationError = validateDepartment(req.body, true);
    if (validationError) return res.status(400).json({ error: validationError });

    try {
      const current = await kv.get('lspd:departments_roster') || [];
      const existing = Array.isArray(current)
        ? current.find(department => String(department.id) === String(req.body.id))
        : null;
      if (!existing) return res.status(404).json({ error: 'Отдел не найден' });

      const updated = {
        ...existing,
        name: req.body.name.trim(),
        icon: req.body.icon?.trim() || '🏢',
        description: req.body.description.trim(),
        leaders: req.body.leaders || []
      };
      const departments = await mutateJsonArray('lspd:departments_roster', 'update', updated);
      await logAdminAction(user, {
        action: 'department.update',
        description: 'Изменил отдел',
        targetId: req.body.id,
        targetName: updated.name
      });
      return res.status(200).json({ success: true, departments });
    } catch (error) {
      console.error('Department update failed:', error);
      return res.status(500).json({ error: 'Ошибка обновления' });
    }
  }

  if (req.method === 'DELETE') {
    if (!(await hasAdminAccess(user))) return res.status(403).json({ error: 'Нет доступа' });
    const id = req.body?.id;
    if ((typeof id !== 'string' && typeof id !== 'number') || !String(id).trim() || String(id).length > 64) {
      return res.status(400).json({ error: 'Укажите корректный ID отдела' });
    }

    try {
      const current = await kv.get('lspd:departments_roster') || [];
      const existing = Array.isArray(current)
        ? current.find(department => String(department.id) === String(id))
        : null;
      if (!existing) return res.status(404).json({ error: 'Отдел не найден' });

      const departments = await mutateJsonArray('lspd:departments_roster', 'delete', { id: String(id) });
      await logAdminAction(user, {
        action: 'department.delete',
        description: 'Удалил отдел',
        targetId: id,
        targetName: existing.name || null
      });
      return res.status(200).json({ success: true, departments });
    } catch (error) {
      console.error('Department deletion failed:', error);
      return res.status(500).json({ error: 'Ошибка удаления' });
    }
  }

  res.setHeader('Allow', 'GET, POST, PUT, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
}
