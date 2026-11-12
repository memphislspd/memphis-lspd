import { kv } from '@vercel/kv';

// Сохранённый список администраторов по Discord ID.
export const ADMINS = [
  '200102286473691139',
  '578179605203255297',
  '1420048443123957862',
];

// Все Discord-роли, которые дают стандартный администраторский доступ.
export const ADMIN_ROLE_IDS = [
  '1514608894700159142',
  '1514608894700159145',
  '1514608894700159143',
  '1550848894789885962',
  '1514665211980939314',
];

export const SUPER_ADMIN_ID = '200102286473691139';

// Оставляем синхронную проверку списка ID для совместимости со старым кодом.
export function isAdmin(userId) {
  return ADMINS.includes(String(userId || ''));
}

export function isSuperAdmin(userOrId) {
  const userId = typeof userOrId === 'string' ? userOrId : userOrId?.id;
  return String(userId || '') === SUPER_ADMIN_ID;
}

// Единая серверная проверка: статический список, Discord-роли,
// супер-администратор или ручной список из KV. При ошибке KV доступ
// по одному только ручному списку не выдаётся (fail closed).
export async function hasAdminAccess(user) {
  const userId = String(user?.id || '');
  if (!userId) return false;

  if (isSuperAdmin(userId) || isAdmin(userId)) return true;

  const roles = Array.isArray(user.roles) ? user.roles : [];
  if (roles.some(roleId => ADMIN_ROLE_IDS.includes(String(roleId)))) {
    return true;
  }

  try {
    const manualAdmins = await kv.get('lspd:manual_admins');
    return Array.isArray(manualAdmins) && manualAdmins.includes(userId);
  } catch (error) {
    console.error('Admin access lookup failed:', error);
    return false;
  }
}
