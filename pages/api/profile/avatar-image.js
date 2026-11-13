import { kv } from '@vercel/kv';
import { verifyToken } from '../../../lib/discord';
import { getDiscordAvatarUrl } from '../../../lib/avatar';

function parseRecord(value) {
  if (!value) return null;
  if (typeof value === 'string') { try { return JSON.parse(value); } catch { return null; } }
  return value && typeof value === 'object' ? value : null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end(); }
  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).end();
  try {
    const key = 'lspd:profile-avatar:' + user.id;
    let record = parseRecord(await kv.get(key));
    if (!record) {
      const initialRecord = { source: 'discord', url: getDiscordAvatarUrl(user), updatedAt: Date.now() };
      await kv.set(key, initialRecord, { nx: true });
      record = parseRecord(await kv.get(key)) || initialRecord;
    }
    res.setHeader('Cache-Control', 'private, max-age=31536000, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (record.source === 'custom' && typeof record.data === 'string') {
      const buffer = Buffer.from(record.data, 'base64');
      const validJpeg = buffer.length >= 4 && buffer.length <= 256 * 1024 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff && buffer[buffer.length - 2] === 0xff && buffer[buffer.length - 1] === 0xd9;
      if (!validJpeg) return res.status(404).end();
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Length', String(buffer.length));
      return res.status(200).end(buffer);
    }
    let avatarUrl;
    try { avatarUrl = new URL(record.url); } catch { return res.status(404).end(); }
    if (avatarUrl.protocol !== 'https:' || avatarUrl.hostname !== 'cdn.discordapp.com') return res.status(404).end();
    return res.redirect(302, avatarUrl.toString());
  } catch (error) {
    console.error('Profile avatar image error:', error);
    return res.status(500).end();
  }
}