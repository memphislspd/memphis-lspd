// pages/api/auth.js
import { getDiscordToken, getDiscordUser, createToken, isAccountOldEnough } from '../../lib/discord';
import { kv } from '@vercel/kv';

const GUILD_ID = '1514608894666735717'; // Твой сервер LSPD

export default async function handler(req, res) {
  const { code, error, state } = req.query;
  const redirectTo = state || '/dashboard';

  if (error) return res.redirect(`/?error=access_denied`);
  if (!code) return res.redirect(`/?error=no_code`);

  try {
    const tokenData = await getDiscordToken(code);
    const user = await getDiscordUser(tokenData.access_token);

    const accountCheck = isAccountOldEnough(user, 5);
    if (!accountCheck.oldEnough) {
      return res.redirect(`/?error=new_account&days=${accountCheck.ageDays}&min=5`);
    }

    // 1. ПОЛУЧАЕМ СПИСОК ВСЕХ СЕРВЕРОВ ПОЛЬЗОВАТЕЛЯ (1 запрос)
    let userGuildIds = [];
    try {
      const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      if (guildsRes.ok) {
        const guilds = await guildsRes.json();
        userGuildIds = guilds.map(g => g.id);
      }
    } catch (e) {
      console.error('Ошибка получения серверов:', e.message);
    }

    // 2. Сохраняем токен и список серверов в KV для фоновой проверки
    await kv.set(`oauth:token:${user.id}`, tokenData.access_token, { ex: 7 * 24 * 3600 });
    await kv.set(`user:guilds:${user.id}`, userGuildIds, { ex: 7 * 24 * 3600 });

    // 3. Получаем роли в LSPD (для админки)
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

    // 4. Создаем JWT и редиректим
    const jwtToken = createToken({ ...user, roles: userRoles });
    res.setHeader('Set-Cookie', `token=${jwtToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400; Secure`);
    res.redirect(redirectTo);

  } catch (error) {
    console.error('Auth error:', error);
    res.redirect('/?error=auth_failed');
  }
}
