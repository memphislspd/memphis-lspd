import { kv } from '@vercel/kv';

const ADMIN_AUDIT_KEY = 'lspd:audit:admin_actions';
const MAX_AUDIT_ENTRIES = 1000;

// Logging failures must never break the admin operation being recorded.
export async function logAdminAction(user, { action, description, targetId = null, targetName = null } = {}) {
  try {
    if (!user?.id || !action || !description) return;
    const entry = {
      id: `${Date.now()}-${String(user.id)}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      actorId: String(user.id),
      actorName: String(user.username || 'Unknown'),
      action: String(action).slice(0, 80),
      description: String(description).slice(0, 240),
      targetId: targetId == null ? null : String(targetId).slice(0, 80),
      targetName: targetName == null ? null : String(targetName).slice(0, 120)
    };
    await kv.lpush(ADMIN_AUDIT_KEY, JSON.stringify(entry));
    await kv.ltrim(ADMIN_AUDIT_KEY, 0, MAX_AUDIT_ENTRIES - 1);
  } catch (error) {
    console.error('Admin audit log write failed:', error);
  }
}
