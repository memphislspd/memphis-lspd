// pages/api/passes.js
import { kv } from '@vercel/kv';
import { verifyToken } from '../../lib/discord';
import { isAdmin } from '../../lib/admins';

export default async function handler(req, res) {
  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const passes = await kv.get('lspd:passes') || [];
    return res.status(200).json(passes);
  }

  if (req.method === 'POST') {
    if (!isAdmin(user.id)) return res.status(403).json({ error: 'No access' });
    const { name, staticId, passNumber, issueDate } = req.body;
    
    if (!name || !staticId || !passNumber || !issueDate) return res.status(400).json({ error: 'Заполните все поля' });
    
    const passes = await kv.get('lspd:passes') || [];
    passes.push({ id: Date.now().toString(), name, staticId, passNumber, issueDate });
    await kv.set('lspd:passes', passes);
    
    return res.status(200).json(passes);
  }
}
