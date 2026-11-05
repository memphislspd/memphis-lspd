// pages/api/admin/super.js
import { verifyToken } from '../../../lib/discord';
import { kv } from '@vercel/kv';

const SUPER_ADMIN_ID = '200102286473691139';

export default async function handler(req, res) {
  const user = verifyToken(req.cookies.token);
  // Доступ только у тебя
  if (!user || user.id !== SUPER_ADMIN_ID) {
    return res.status(403).json({ error: 'Только создатель может управлять этим' });
  }

  if (req.method === 'GET') {
    const admins = await kv.get('lspd:manual_admins') || [];
    return res.status(200).json(admins);
  }

  if (req.method === 'POST') {
    const { discordId } = req.body;
    if (!discordId || discordId.length < 15) return res.status(400).json({ error: 'Неверный ID' });

    let admins = await kv.get('lspd:manual_admins') || [];
    if (!admins.includes(discordId)) {
      admins.push(discordId);
      await kv.set('lspd:manual_admins', admins);
    }
    return res.status(200).json(admins);
  }

  if (req.method === 'DELETE') {
    const { discordId } = req.body;
    let admins = await kv.get('lspd:manual_admins') || [];
    admins = admins.filter(id => id !== discordId);
    await kv.set('lspd:manual_admins', admins);
    return res.status(200).json(admins);
  }
}
