import { kv } from '@vercel/kv';
import { verifyToken } from '../../lib/discord';
import { hasAdminAccess } from '../../lib/admins';
import { mutateJsonArray, patchJsonArrayItem } from '../../lib/kv-atomic';
import { logAdminAction } from '../../lib/admin-audit';
import { getPassStatus, isValidDate, normalizePass, validatePass } from '../../lib/pass-utils.mjs';

const PASSES_KEY = 'lspd:passes';

function withPassStatuses(passes) {
  const today = new Date().toISOString().slice(0, 10);
  return passes.map(pass => ({ ...pass, ...getPassStatus(pass, today) }));
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
