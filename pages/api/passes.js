
import { kv } from '@vercel/kv';
import { verifyToken } from '../../lib/discord';
import { hasAdminAccess } from '../../lib/admins';

export default async function handler(req, res) {
  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // GET
  if (req.method === 'GET') {
    const passes = await kv.get('lspd:passes') || [];
    return res.status(200).json(passes);
  }

  // POST
  if (req.method === 'POST') {
    if (!(await hasAdminAccess(user))) return res.status(403).json({ error: 'Нет доступа' });
    const { name, staticId, passNumber, issueDate, link } = req.body;
    
    if (!name || !staticId || !passNumber || !issueDate) return res.status(400).json({ error: 'Заполните обязательные поля' });
    
    const passes = await kv.get('lspd:passes') || [];
    passes.push({ 
      id: Date.now().toString(), 
      name, 
      staticId, 
      passNumber, 
      issueDate,
      link: link || '' // Сохраняем ссылку (если пустая - пустая строка)
    });
    await kv.set('lspd:passes', passes);
    
    return res.status(200).json(passes);
  }

  // DELETE
  if (req.method === 'DELETE') {
    if (!(await hasAdminAccess(user))) return res.status(403).json({ error: 'Нет доступа' });
    const { id } = req.body;
    
    let passes = await kv.get('lspd:passes') || [];
    passes = passes.filter(p => p.id !== id);
    await kv.set('lspd:passes', passes);
    
    return res.status(200).json(passes);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
