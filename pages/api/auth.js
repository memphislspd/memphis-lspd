import { getDiscordToken, getDiscordUser, createToken, isAccountOldEnough } from '../../lib/discord';

const GUILD_ID = '1514608894666735717'; // ← ЗАМЕНИ на ID своего сервера

export default async function handler(req, res) {
  const { code, error, state } = req.query;

  const redirectTo = state || '/dashboard';

  if (error) return res.redirect(`/?error=access_denied`);
  if (!code) return res.redirect(`/?error=no_code`);

  try {
    const tokenData = await getDiscordToken(code);
    const user = await getDiscordUser(tokenData.access_token);

    // === Проверка возраста аккаунта ===
    const accountCheck = isAccountOldEnough(user, 5);
    if (!accountCheck.oldEnough) {
      return res.redirect(`/?error=new_account&days=${accountCheck.ageDays}&min=90`);
    }

    // === Получение ролей пользователя на сервере ===
    let userRoles = [];
    try {
      const memberRes = await fetch(
        `https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`,
        { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
      );

      if (memberRes.ok) {
        const member = await memberRes.json();
        userRoles = member.roles || [];
        console.log('✅ Роли пользователя:', userRoles);
      } else {
        const errText = await memberRes.text();
        console.error('❌ Ошибка получения ролей:', memberRes.status, errText);
      }
    } catch (e) {
      console.error('❌ Ошибка запроса ролей:', e.message);
    }

    // === Создание JWT с ролями ===
    const jwtToken = createToken({ ...user, roles: userRoles });

    res.setHeader('Set-Cookie', `token=${jwtToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400; Secure`);
    const debugUrl = `${redirectTo}?roles=${encodeURIComponent(JSON.stringify(userRoles))}`;
res.redirect(debugUrl);
  } catch (error) {
    console.error('Auth error:', error);
    res.redirect('/?error=auth_failed');
  }
}
