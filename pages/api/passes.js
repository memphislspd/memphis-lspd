import { kv } from '@vercel/kv';
import { verifyToken } from '../../lib/discord';
import { hasAdminAccess } from '../../lib/admins';
import { mutateJsonArray, patchJsonArrayItem } from '../../lib/kv-atomic';
import { logAdminAction } from '../../lib/admin-audit';

const PASSES_KEY = 'lspd:passes';

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function getPassStatus(pass, today) {
  if (pass.revokedAt) {
    return { status: 'revoked', statusLabel: 'АННУЛИРОВАН', statusReason: 'Аннулирован администратором' };
  }
  if (pass.validUntil && isValidDate(pass.validUntil) && today > pass.validUntil) {
    return { status: 'expired', statusLabel: 'АННУЛИРОВАН', statusReason: 'Срок действия истёк автоматически' };
  }
  if (pass.validFrom && isValidDate(pass.validFrom) && today < pass.validFrom) {
    return { status: 'pending', statusLabel: 'ЕЩЁ НЕ ДЕЙСТВУЕТ', statusReason: 'Срок действия ещё не начался' };
  }
  if (isValidDate(pass.validFrom) && isValidDate(pass.validUntil)) {
    return { status: 'active', statusLabel: 'ДЕЙСТВУЕТ', statusReason: 'Пропуск действителен' };
  }
  return { status: 'unspecified', statusLabel: 'СРОК НЕ ЗАДАН', statusReason: 'Для этой старой записи не указан период действия' };
}

function withPassStatuses(passes) {
  const today = new Date().toISOString().slice(0, 10);
  return passes.map(pass => ({ ...pass, ...getPassStatus(pass, today) }));
}

function normalizePass(body) {
  return {
    name: String(body.name || '').trim(),
    staticId: String(body.staticId || '').trim(),
    passNumber: String(body.passNumber || '').trim(),
    issueDate: String(body.issueDate || '').trim(),
    validFrom: String(body.validFrom || '').trim(),
    validUntil: String(body.validUntil || '').trim(),
    link: String(body.link || '').trim()
  };
}

function validatePass(pass) {
  if (!pass.name || !pass.staticId || !pass.passNumber) return 'Заполните имя, статик и номер пропуска';
  if (pass.name.length > 120 || pass.staticId.length > 40 || pass.passNumber.length > 40) return 'Проверьте длину полей';
  if (!isValidDate(pass.issueDate)) return 'Укажите корректную дату выдачи';
  if (!isValidDate(pass.validFrom) || !isValidDate(pass.validUntil)) return 'Укажите корректные даты начала и окончания действия';
  if (pass.validFrom > pass.validUntil) return 'Дата «ОТ» не может быть позже даты «ДО»';
  if (pass.link) {
    try {
      const url = new URL(pass.link);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') return 'Ссылка должна начинаться с HTTP или HTTPS';
    } catch {
      return 'Укажите корректную ссылку';
    }
    if (pass.link.length > 2048) return 'Ссылка слишком длинная';
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      const passes = await kv.get(PASSES_KEY) || [];
      return res.status(200).json(withPassStatuses(Array.isArray(passes) ? passes : []));
    } catch (error) {
      console.error('Passes read failed:', error);
      return res.status(500).json({ error: 'Не удалось загрузить реестр пропусков' });
    }
  }

  if (!(await hasAdminAccess(user))) return res.status(403).json({ error: 'Нет доступа' });

  if (req.method === 'POST') {
    const passData = normalizePass(req.body || {});
    const validationError = validatePass(passData);
    if (validationError) return res.status(400).json({ error: validationError });

    try {
      const pass = {
        id: `${Date.now()}-${String(user.id)}`,
        ...passData,
        createdAt: new Date().toISOString(),
        createdBy: String(user.id)
      };
      const passes = await mutateJsonArray(PASSES_KEY, 'add', pass);
      await logAdminAction(user, {
        action: 'pass.create',
        description: 'Добавил пропуск в реестр',
        targetId: pass.id,
        targetName: pass.name
      });
      return res.status(201).json(withPassStatuses(passes));
    } catch (error) {
      console.error('Pass creation failed:', error);
      return res.status(500).json({ error: 'Не удалось добавить пропуск' });
    }
  }

  if (req.method === 'PATCH') {
    const { id, action } = req.body || {};
    if (!id || !['update', 'revoke'].includes(action)) {
      return res.status(400).json({ error: 'Некорректное действие или ID пропуска' });
    }

    try {
      const current = await kv.get(PASSES_KEY) || [];
      const pass = Array.isArray(current) ? current.find(item => String(item.id) === String(id)) : null;
      if (!pass) return res.status(404).json({ error: 'Пропуск не найден' });

      if (action === 'revoke') {
        if (pass.revokedAt) return res.status(409).json({ error: 'Этот пропуск уже аннулирован' });
        const today = new Date().toISOString().slice(0, 10);
        const status = getPassStatus(pass, today);
        if (status.status === 'expired') {
          return res.status(409).json({ error: 'Срок действия пропуска уже истёк автоматически' });
        }

        const patch = {
          id: String(id),
          revokedAt: new Date().toISOString(),
          revokedBy: String(user.id)
        };
        const passes = await patchJsonArrayItem(PASSES_KEY, patch);
        await logAdminAction(user, {
          action: 'pass.revoke',
          description: 'Аннулировал пропуск',
          targetId: id,
          targetName: pass.name
        });
        return res.status(200).json(withPassStatuses(passes));
      }

      const passData = normalizePass(req.body || {});
      const validationError = validatePass(passData);
      if (validationError) return res.status(400).json({ error: validationError });

      const patch = { id: String(id), ...passData, updatedAt: new Date().toISOString(), updatedBy: String(user.id) };
      const passes = await patchJsonArrayItem(PASSES_KEY, patch);
      await logAdminAction(user, {
        action: 'pass.update',
        description: 'Изменил данные пропуска',
        targetId: id,
        targetName: passData.name
      });
      return res.status(200).json(withPassStatuses(passes));
    } catch (error) {
      console.error('Pass update failed:', error);
      return res.status(500).json({ error: 'Не удалось обновить пропуск' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
