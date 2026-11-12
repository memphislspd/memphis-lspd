// pages/api/auth/start.js
import { randomBytes } from 'crypto';

const DEFAULT_REDIRECT_URI = 'https://memphis-lspd.vercel.app/api/auth';
const OAUTH_COOKIE_PATH = '/api/auth';
const STATE_TTL_SECONDS = 10 * 60;

function getSafeReturnTo(value) {
  if (
    typeof value !== 'string' ||
    value.length > 2048 ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\') ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return '/start';
  }

  try {
    const base = new URL('https://memphis-lspd.vercel.app');
    const target = new URL(value, base);
    if (target.origin !== base.origin) return '/start';
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return '/start';
  }
}

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI || DEFAULT_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return res.redirect('/?error=auth_config');
  }

  const returnTo = getSafeReturnTo(req.query.returnTo);
  const state = randomBytes(32).toString('hex');
  const secure = process.env.NODE_ENV === 'production' ||
    req.headers['x-forwarded-proto'] === 'https';
  const secureFlag = secure ? '; Secure' : '';
  const cookieBase = `Path=${OAUTH_COOKIE_PATH}; HttpOnly; SameSite=Lax; Max-Age=${STATE_TTL_SECONDS}${secureFlag}`;

  res.setHeader('Set-Cookie', [
    `oauth_state=${state}; ${cookieBase}`,
    `oauth_return_to=${encodeURIComponent(returnTo)}; ${cookieBase}`,
  ]);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify guilds guilds.members.read',
    state,
  });

  return res.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
}
