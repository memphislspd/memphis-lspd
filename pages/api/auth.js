// pages/api/auth.js
import { timingSafeEqual } from 'crypto';
import { getDiscordToken, getDiscordUser, createToken, isAccountOldEnough } from '../../lib/discord';
import { kv } from '@vercel/kv';
import { getDiscordAvatarUrl } from '../../lib/avatar';

const GUILD_ID = '1514608894666735717'; // Твой сервер LSPD
const OAUTH_COOKIE_PATH = '/api/auth';

function safeReturnTo(encodedValue) {
  if (
    typeof encodedValue !== 'string' ||
    encodedValue.length > 4096 ||
    !/^[A-Za-z0-9_-]+$/.test(encodedValue)
  ) {
    return '/start';
  }

  const decodedValue = Buffer.from(encodedValue, 'base64url').toString('utf8');
  if (Buffer.from(decodedValue, 'utf8').toString('base64url') !== encodedValue) {
    return '/start';
  }

  if (
    decodedValue.length > 2048 ||
    !decodedValue.startsWith('/') ||
    decodedValue.startsWith('//') ||
    decodedValue.includes('\\') ||
    /[\u0000-\u001f\u007f]/.test(decodedValue)
  ) {
    return '/start';
  }

  try {
    const base = new URL('https://memphis-lspd.vercel.app');
    const target = new URL(decodedValue, base);
    if (target.origin !== base.origin) return '/start';
    const normalizedPath = '/' + decodeURIComponent(target.pathname).split('/').filter(Boolean).join('/');
    if (normalizedPath === '/dashboard') return '/start';
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return '/start';
  }
}

function statesMatch(received, expected) {
  if (
    typeof received !== 'string' ||
    typeof expected !== 'string' ||
    !/^[a-f0-9]{64}$/.test(received) ||
    !/^[a-f0-9]{64}$/.test(expected)
  ) {
    return false;
  }

  const receivedBuffer = Buffer.from(received, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  return receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer);
}

function clearOAuthCookies(req) {
  const secure = process.env.NODE_ENV === 'production' ||
    req.headers['x-forwarded-proto'] === 'https';
  const secureFlag = secure ? '; Secure' : '';
  const clearCookie = `Path=${OAUTH_COOKIE_PATH}; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secureFlag}`;

  return [
    `oauth_state=; ${clearCookie}`,
    `oauth_return_to=; ${clearCookie}`,
  ];
}

function redirectWithClearedCookies(req, res, destination) {
  res.setHeader('Set-Cookie', clearOAuthCookies(req));
  return res.redirect(destination);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, error, state } = req.query;
  const expectedState = req.cookies.oauth_state;

  // OAuth callback is accepted only for a login started in this browser.
  if (!statesMatch(state, expectedState)) {
    return redirectWithClearedCookies(req, res, '/?error=oauth_state');
  }

  const redirectTo = safeReturnTo(req.cookies.oauth_return_to);

  if (error) {
    return redirectWithClearedCookies(req, res, '/?error=access_denied');
  }

  if (typeof code !== 'string' || !code) {
    return redirectWithClearedCookies(req, res, '/?error=no_code');
  }

  try {
    const tokenData = await getDiscordToken(code);
    const user = await getDiscordUser(tokenData.access_token);

    const accountCheck = isAccountOldEnough(user, 5);
    if (!accountCheck.oldEnough) {
      return redirectWithClearedCookies(
        req,
        res,
        `/?error=new_account&days=${accountCheck.ageDays}&min=5`
      );
    }

    // 1. Получаем список всех серверов пользователя.
    let userGuildIds = [];
    try {
      const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      if (guildsRes.ok) {
        const guilds = await guildsRes.json();
        userGuildIds = guilds.map(g => g.id);
        console.log(`[АВТОРИЗАЦИЯ] Получено ${userGuildIds.length} серверов.`);
      } else {
        console.error('[АВТОРИЗАЦИЯ] Ошибка получения серверов:', guildsRes.status);
      }
    } catch (e) {
      console.error('Ошибка получения серверов:', e.message);
    }

    // 2. Сохраняем токен и список серверов в KV.
    await kv.set(`oauth:token:${user.id}`, tokenData.access_token, { ex: 7 * 24 * 3600 });
    await kv.set(`user:guilds:${user.id}`, userGuildIds, { ex: 7 * 24 * 3600 });

    // 3. Получаем роли в LSPD.
    let userRoles = [];
    try {
      const memberRes = await fetch(
        `https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`,
        { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
      );
      if (memberRes.ok) {
        const member = await memberRes.json();
        userRoles = member.roles || [];
      }
    } catch (e) {
      console.error('Ошибка ролей LSPD:', e.message);
    }

    // 4. Сохраняем роли и информацию пользователя для админки проверки.
    await kv.set(`user:roles:${user.id}`, userRoles, { ex: 7 * 24 * 3600 });
    await kv.set(`user:info:${user.id}`, { username: user.username, avatar: user.avatar }, { ex: 7 * 24 * 3600 });

    // Discord-фото фиксируется при первом входе и не перезаписывает выбор пользователя.
    try {
      const avatarKey = `lspd:profile-avatar:${user.id}`;
      const savedAvatar = await kv.get(avatarKey);
      if (!savedAvatar) {
        await kv.set(avatarKey, { source: 'discord', url: getDiscordAvatarUrl(user), updatedAt: Date.now() }, { nx: true });
      }
    } catch (avatarError) {
      console.error('Не удалось сохранить первоначальный аватар Discord:', avatarError);
    }

    // 5. Создаем сессию и очищаем временные OAuth cookies.
    const jwtToken = createToken({ ...user, roles: userRoles });
    const secure = process.env.NODE_ENV === 'production' ||
      req.headers['x-forwarded-proto'] === 'https';
    const secureFlag = secure ? '; Secure' : '';
    res.setHeader('Set-Cookie', [
      ...clearOAuthCookies(req),
      `token=${jwtToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${secureFlag}`,
    ]);
    return res.redirect(redirectTo);

  } catch (authError) {
    console.error('Auth error:', authError);
    return redirectWithClearedCookies(req, res, '/?error=auth_failed');
  }
}
