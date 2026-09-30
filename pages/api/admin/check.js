import { verifyToken } from '../../../lib/discord';
import { isAdmin, ADMINS } from '../../../lib/admins';

export default function handler(req, res) {
  const user = verifyToken(req.cookies.token);
  
  if (!user) {
    return res.status(200).json({ isAdmin: false });
  }

  res.status(200).json({ 
    isAdmin: isAdmin(user.id),
    userId: user.id 
  });
}
