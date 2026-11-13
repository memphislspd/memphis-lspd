import { kv } from '@vercel/kv';
import { verifyToken } from '../../../lib/discord';
import { getDiscordAvatarUrl } from '../../../lib/avatar';

const MAX_AVATAR_BYTES = 256 * 1024;

function parseRecord(value) {
  if (!value) return null;
  if (typeof value === 'string') { try { return JSON.parse(value); } catch { return null; } }
  return value && typeof value === 'object' ? value : null;
}

async function getOrCreateAvatar(user) {
  const key = 'lspd:profile-avatar:' + user.id;
  let record = parseRecord(await kv.get(key));
  if (!record) {
    const initialRecord = { source: 'discord', url: getDiscordAvatarUrl(user), updatedAt: Date.now() };
    await kv.set(key, initialRecord, { nx: true });
    record = parseRecord(await kv.get(key)) || initialRecord;
  }
  return record;
}

function versionedAvatarUrl(record) {
  return '/api/profile/avatar-image?v=' + (Number(record && record.updatedAt) || 0);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const key = 'lspd:profile-avatar:' + user.id;

  if (req.method === 'GET') {
    try {
      const record = await getOrCreateAvatar(user);
      return res.status(200).json({ avatarUrl: versionedAvatarUrl(record), source: record.source === 'custom' ? 'custom' : 'discord' });
    } catch (error) {
      console.error('Profile avatar GET error:', error);
      return res.status(500).json({ error: 'Не удалось загрузить фото профиля' });
    }
  }

  if (req.method === 'POST') {
    const avatar = req.body && req.body.avatar;
    const match = typeof avatar === 'string' ? avatar.match(new RegExp('^data:image/jpeg;base64,([A-Za-z0-9+/]+={0,2})$')) : null;
    if (!match) return res.status(400).json({ error: 'Загрузите изображение в формате JPG или PNG.' });
    const buffer = Buffer.from(match[1], 'base64');
    const validJpeg = buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff && buffer[buffer.length - 2] === 0xff && buffer[buffer.length - 1] === 0xd9;
    if (!validJpeg) return res.status(400).json({ error: 'Не удалось обработать изображение. Выберите другой файл.' });
    if (buffer.length > MAX_AVATAR_BYTES) return res.status(413).json({ error: 'Фото слишком большое. Выберите изображение меньшего размера.' });
    try {
      const record = { source: 'custom', mimeType: 'image/jpeg', data: match[1], updatedAt: Date.now() };
      await kv.set(key, record);
      return res.status(200).json({ success: true, avatarUrl: versionedAvatarUrl(record), source: 'custom' });
    } catch (error) {
      console.error('Profile avatar POST error:', error);
      return res.status(500).json({ error: 'Не удалось сохранить фото профиля' });
    }
  }
  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}