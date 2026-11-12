// pages/api/admin/super.js
import { verifyToken } from '../../../lib/discord';
import { isSuperAdmin } from '../../../lib/admins';
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (!isSuperAdmin(user)) {
    return res.status(403).json({ error: 'Только создатель может управлять этим' });
  }

  if (req.method === 'GET') {
    const admins = await kv.get('lspd:manual_admins') || [];
    return res.status(200).json(Array.isArray(admins) ? admins : []);
  }

  if (req.method === 'POST') {
    const { discordId } = req.body || {};
    if (!discordId || !/^\d{15,22}$/.test(String(discordId))) {
      return res.status(400).json({ error: 'Неверный ID' });
    }

    const current = await kv.get('lspd:manual_admins');
    const admins = Array.isArray(current) ? current : [];
    if (!admins.includes(String(discordId))) {
      admins.push(String(discordId));
      await kv.set('lspd:manual_admins', admins);
    }
    return res.status(200).json(admins);
  }

  if (req.method === 'DELETE') {
    const { discordId } = req.body || {};
    if (!discordId) return res.status(400).json({ error: 'Неверный ID' });

    const current = await kv.get('lspd:manual_admins');
    const admins = Array.isArray(current) ? current : [];
    const updated = admins.filter(id => id !== String(discordId));
    await kv.set('lspd:manual_admins', updated);
    return res.status(200).json(updated);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
