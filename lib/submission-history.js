import { kv } from '@vercel/kv';

export async function recordSubmissionHistory(userId, { type, title, status }) {
  if (!userId) return null;
  const entry = {
    type: String(type || 'unknown').slice(0, 40),
    title: String(title || 'Заявка').slice(0, 180),
    date: new Date().toISOString(),
    id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
    status: status === 'sent' ? 'sent' : 'not_sent',
  };
  try {
    const key = 'lspd:history:' + userId;
    await kv.lpush(key, JSON.stringify(entry));
    await kv.ltrim(key, 0, 49);
    return entry;
  } catch (error) {
    console.error('Submission history storage error:', error);
    return null;
  }
}