import { kv } from '@vercel/kv';
import { getCurrentGuildRoles } from './discord-roles';
import {
  ADMIN_ROLE_IDS,
  SUPER_ADMIN_ID,
  isStaticAdminId,
  isSuperAdminId,
  canAccessAdmin
} from './access-policy.mjs';

export { ADMIN_ROLE_IDS, SUPER_ADMIN_ID };

const DENIED_ADMINS_KEY = 'lspd:admin_denied_ids';

export function isAdmin(userId) {
  return isStaticAdminId(userId);
}

export function isSuperAdmin(userOrId) {
  const userId = typeof userOrId === 'string' ? userOrId : userOrId?.id;
  return isSuperAdminId(userId);
}

export async function hasAdminAccess(user) {
  const userId = String(user?.id || '');
  if (!userId) return false;

  // The explicit deny-list always overrides static IDs, live Discord roles and manual grants.
  try {
    const denied = await kv.sismember(DENIED_ADMINS_KEY, userId);
    if (denied) return false;
  } catch (error) {
    console.error('Admin deny-list lookup failed:', error?.name || 'Error');
    return false;
  }

  // Stable built-in administrators do not depend on Discord role API availability.
  if (isStaticAdminId(userId)) return true;

  let manualAdmins = [];
  try {
    const storedManualAdmins = await kv.get('lspd:manual_admins');
    manualAdmins = Array.isArray(storedManualAdmins) ? storedManualAdmins : [];
  } catch (error) {
    console.error('Manual admin list lookup failed:', error?.name || 'Error');
  }

  if (canAccessAdmin({ userId, manualAdmins })) return true;

  // Never authorize from the roles embedded in the 24-hour JWT: Discord roles can be removed.
  // If Discord cannot confirm current membership, role-based admin access fails closed.
  const currentRoles = await getCurrentGuildRoles(userId);
  if (!Array.isArray(currentRoles)) return false;

  return canAccessAdmin({ userId, roles: currentRoles, manualAdmins });
}
