// pages/api/auth.js
import { getDiscordToken, getDiscordUser, createToken, isAccountOldEnough } from '../../lib/discord';
import { checkCriminalActivity } from '../../lib/security';

const GUILD_ID = '1514608894666735717';
const WEBHOOK_SECURITY = process.env.WEBHOOK_SECURITY;

export default async function handler(req, res) {
  const { code, error, state } = req.query;
  const redirectTo = state || '/dashboard';

  if (error) return res.redirect(`/?error=access_denied`);
  if (!code) return res.redirect(`/?error=no_code`);

  try {
    const tokenData = await getDiscordToken(code);
    const user = await getDiscordUser(tokenData.access_token);

    // 1. Проверка возраста
    const accountCheck = isAccountOldEnough(user, 5);
    if (!accountCheck.oldEnough) {
      return res.redirect(`/?error=new_account&days=${accountCheck.ageDays}&min=5`);
    }

    // 2. Получение ролей LSPD (для админки)
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

    // 3. ПРОВЕРКА НА КРАЙМ И ЛОГИРОВАНИЕ (прямо здесь!)
    try {
      const alerts = await checkCriminalActivity(tokenData.access_token);
      if (alerts.length > 0 && WEBHOOK_SECURITY) {
        const fields = alerts.map(a => ({
          name: `🚨 Сервер: ${a.guildName}`,
          value: `Найдены роли: **${a.matchedRoles.join(', ')}**\nID: \`${a.guildId}\``,
          inline: false
        }));

        await fetch(WEBHOOK_SECURITY, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `<@${user.id}>`,
            embeds: [{
              title: '⚠️ Проверка на крайм-активность',
              color: 0xFF0000,
              author: {
                name: `${user.username} (${user.id})`,
                icon_url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
              },
              fields: fields,
              timestamp: new Date().toISOString(),
            }],
          }),
        });
      }
    } catch (e) {
      console.error('Ошибка проверки на крайм:', e.message);
    }

    // 4. Создание JWT и редирект
    const jwtToken = createToken({ ...user, roles: userRoles });
    res.setHeader('Set-Cookie', `token=${jwtToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400; Secure`);
    res.redirect(redirectTo);

  } catch (error) {
    console.error('Auth error:', error);
    res.redirect('/?error=auth_failed');
  }
}
