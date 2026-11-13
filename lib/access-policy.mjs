export const STATIC_ADMIN_IDS = [
  '200102286473691139',
  '578179605203255297',
  '1420048443123957862'
];

export const ADMIN_ROLE_IDS = [
  '1514608894700159142',
  '1514608894700159145',
  '1514608894700159143',
  '1550848894789885962',
  '1514665211980939314'
];

export const SUPER_ADMIN_ID = '200102286473691139';
export const STAFF_ROLE_ID = '1552313180041121802';
export const HIGH_RANK_ROLE_ID = '1514608894679191597';

export function isValidDiscordId(value) {
  return /^\d{15,22}$/.test(String(value || ''));
}

export function isSuperAdminId(userId) {
  return String(userId || '') === SUPER_ADMIN_ID;
}

export function isStaticAdminId(userId) {
  return STATIC_ADMIN_IDS.includes(String(userId || ''));
}

export function hasAnyRole(roles, allowedRoleIds) {
  if (!Array.isArray(roles) || !Array.isArray(allowedRoleIds)) return false;
  const allowed = new Set(allowedRoleIds.map(String));
  return roles.some(roleId => allowed.has(String(roleId)));
}

export function canAccessAdmin({ userId, denied = false, roles = [], manualAdmins = [] }) {
  const id = String(userId || '');
  if (!id || denied) return false;
  if (isStaticAdminId(id)) return true;
  if (hasAnyRole(roles, ADMIN_ROLE_IDS)) return true;
  return Array.isArray(manualAdmins) && manualAdmins.some(value => String(value) === id);
}
