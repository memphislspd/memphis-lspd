// pages/api/admin/check.js
import { verifyToken } from '../../../lib/discord';
import { kv } from '@vercel/kv';

// Твои роли, которые дают доступ к админке
const ADMIN_ROLE_IDS = [
  '1514608894700159142', // Основная роль
  '1514608894700159145',
  '1514608894700159143',
  '1550848894789885962',
  '1514665211980939314'
];

// Твой личный ID (нельзя удалить)
const SUPER_ADMIN_ID = '200102286473691139';

export default async function handler(req, res) {
  const user = verifyToken(req.cookies.token);
  
  if (!user) {
    return res.status(200).json({ isAdmin: false });
  }

  // 1. Проверка на супер-админа (тебя)
  if (user.id === SUPER_ADMIN_ID) {
    return res.status(200).json({ isAdmin: true, isSuperAdmin: true, userId: user.id });
  }

  // 2. Проверка ручного списка из базы
  const manualAdmins = await kv.get('lspd:manual_admins') || [];
  if (manualAdmins.includes(user.id)) {
    return res.status(200).json({ isAdmin: true, isSuperAdmin: false, userId: user.id });
  }

  // 3. Проверка по ролям Discord
  const hasAdminRole = (user.roles || []).some(roleId => ADMIN_ROLE_IDS.includes(roleId));
  
  res.status(200).json({ 
    isAdmin: hasAdminRole,
    isSuperAdmin: false,
    userId: user.id,
    roles: user.roles || []
  });
}
