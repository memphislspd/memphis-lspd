// pages/api/passes.js
import { kv } from '@vercel/kv';
import { verifyToken } from '../../lib/discord';

const ADMIN_ROLE_IDS = [
  '1514608894700159142', '1514608894700159145', 
  '1514608894700159143', '1550848894789885962', '1514665211980939314'
];
const SUPER_ADMIN_ID = '200102286473691139';

export default async function handler(req, res) {
  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const hasRole = (user.roles || []).some(r => ADMIN_ROLE_IDS.includes(r));
  const isAdminUser = user.id === SUPER_ADMIN_ID || hasRole;

  // GET: Получить все пропуска
  if (req.method === 'GET') {
    const passes = await kv.get('lspd:passes') || [];
    return res.status(200).json(passes);
  }

  // POST: Добавить пропуск
  if (req.method === 'POST') {
    if (!isAdminUser) return res.status(403).json({ error: 'Нет доступа' });
    const { name, staticId, passNumber, issueDate } = req.body;
    
    if (!name || !staticId || !passNumber || !issueDate) return res.status(400).json({ error: 'Заполните все поля' });
    
    const passes = await kv.get('lspd:passes') || [];
    passes.push({ id: Date.now().toString(), name, staticId, passNumber, issueDate });
    await kv.set('lspd:passes', passes);
    
    return res.status(200).json(passes);
  }

  // DELETE: Удалить пропуск
  if (req.method === 'DELETE') {
    if (!isAdminUser) return res.status(403).json({ error: 'Нет доступа' });
    const { id } = req.body;
    
    let passes = await kv.get('lspd:passes') || [];
    passes = passes.filter(p => p.id !== id);
    await kv.set('lspd:passes', passes);
    
    return res.status(200).json(passes);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
