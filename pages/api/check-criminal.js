// pages/api/check-criminal.js
import { randomUUID } from 'crypto';
import { verifyToken } from '../../lib/discord';
import { kv } from '@vercel/kv';
import { checkCriminalActivity } from '../../lib/security';

const WEBHOOK_SECURITY = process.env.WEBHOOK_SECURITY;
const SECURITY_ROLE_ID = '1563222369655459941';

const CACHE_TTL_SECONDS = 12 * 60 * 60;
const LOCK_TTL_SECONDS = 6 * 60;

function readCompletedCache(value) {
  let cached = value;

  if (typeof cached === 'string') {
    try {
      cached = JSON.parse(cached);
    } catch {
      return null;
    }
  }

  if (
    !cached ||
    cached.complete !== true ||
    !Array.isArray(cached.alerts) ||
    typeof cached.checkedAt !== 'string'
  ) {
    return null;
  }

  return cached;
}

async function sendSecurityAlert(user, alerts) {
  const fields = alerts.map(alert => ({
    name: \`🚨 Сервер: \${alert.guildName}\`,
    value: \`Найдены роли: **\${alert.matchedRoles.join(', ')}**\\nID: \\\`\${alert.guildId}\\\`\`,
    inline: false,
  }));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(WEBHOOK_SECURITY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        content: \`<@&\${SECURITY_ROLE_ID}> <@\${user.id}>\`,
        embeds: [{
          title: '⚠️ Проверка на крайм-активность',
          color: 0xFF0000,
          author: {
            name: \`\${user.username} (\${user.id})\`,
            icon_url: user.avatar
              ? \`https://cdn.discordapp.com/avatars/\${user.id}/\${user.avatar}.png\`
              : undefined,
          },
          fields,
          timestamp: new Date().toISOString(),
        }],
      }),
    });

    if (!response.ok) {
      throw new Error(\`Security webhook returned HTTP \${response.status}\`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const cacheKey = \`criminal_checked:v1:\${user.id}\`;
  const lockKey = \`criminal_check_lock:v1:\${user.id}\`;
  let lockAcquired = false;

  try {
    // 1. Используем результат предыдущей полной проверки, если ему меньше 12 часов.
    try {
      const cached = readCompletedCache(await kv.get(cacheKey));
      if (cached) {
        return res.status(200).json({
          success: true,
          cached: true,
          checkedAt: cached.checkedAt,
          alerts: cached.alerts,
        });
      }
    } catch (error) {
      // Если кэш временно недоступен, не выдаём ошибку вместо проверки.
      console.warn('[КРАЙМ] Не удалось прочитать кэш:', error.message);
    }

    // 2. Не допускаем параллельный запуск проверки одного пользователя в нескольких вкладках.
    // TTL замка больше максимального времени выполнения Vercel Function (300 секунд).
    try {
      const lockResult = await kv.set(lockKey, randomUUID(), {
        ex: LOCK_TTL_SECONDS,
        nx: true,
      });

      lockAcquired = lockResult === 'OK';

      if (!lockAcquired) {
        // Пока другой запрос проверяет пользователя, повторно Discord API не вызываем.
        const cached = readCompletedCache(await kv.get(cacheKey));
        if (cached) {
          return res.status(200).json({
            success: true,
            cached: true,
            checkedAt: cached.checkedAt,
            alerts: cached.alerts,
          });
        }

        return res.status(202).json({ success: true, checking: true });
      }
    } catch (error) {
      // При недоступности механизма блокировки продолжаем проверку,
      // но не считаем её закэшированной до успешной записи результата.
      console.warn('[КРАЙМ] Не удалось установить блокировку проверки:', error.message);
    }

    // 3. После получения блокировки перечитываем кэш на случай гонки запросов.
    if (lockAcquired) {
      const cached = readCompletedCache(await kv.get(cacheKey));
      if (cached) {
        return res.status(200).json({
          success: true,
          cached: true,
          checkedAt: cached.checkedAt,
          alerts: cached.alerts,
        });
      }
    }

    const accessToken = await kv.get(\`oauth:token:\${user.id}\`);
    const userGuildIds = await kv.get(\`user:guilds:\${user.id}\`);

    if (!accessToken || !Array.isArray(userGuildIds)) {
      return res.status(200).json({
        success: true,
        cached: false,
        message: 'No data yet',
      });
    }

    // 4. Выполняем проверку. Частичный результат никогда не записываем в кэш.
    const checkResult = await checkCriminalActivity(accessToken, userGuildIds);

    if (!checkResult.complete) {
      console.warn('[КРАЙМ] Проверка завершилась не полностью:', {
        userId: user.id,
        checkedGuilds: checkResult.checkedGuilds,
        totalGuilds: checkResult.totalGuilds,
        failedGuilds: checkResult.failedGuilds,
      });

      return res.status(200).json({
        success: false,
        incomplete: true,
        cached: false,
        checkedGuilds: checkResult.checkedGuilds,
        totalGuilds: checkResult.totalGuilds,
      });
    }

    // 5. При найденных совпадениях сначала доставляем уведомление.
    // Если Webhook недоступен, результат не кэшируем: следующая загрузка сможет повторить отправку.
    if (checkResult.alerts.length > 0) {
      if (!WEBHOOK_SECURITY) {
        console.error('[КРАЙМ] WEBHOOK_SECURITY не настроен; результат не кэшируется.');
        return res.status(200).json({
          success: false,
          notificationSent: false,
          cached: false,
          alerts: checkResult.alerts,
        });
      }

      await sendSecurityAlert(user, checkResult.alerts);
      console.log(\`[КРАЙМ] Найдено совпадений: \${checkResult.alerts.length}. Webhook отправлен.\`);
    } else {
      console.log('[КРАЙМ] Проверка завершена. Совпадений нет.');
    }

    // 6. Храним только подтверждённый полный результат. Ручного обхода кэша нет.
    const completedResult = {
      complete: true,
      checkedAt: new Date().toISOString(),
      checkedGuilds: checkResult.checkedGuilds,
      totalGuilds: checkResult.totalGuilds,
      alerts: checkResult.alerts,
    };

    let cacheStored = false;
    try {
      await kv.set(cacheKey, completedResult, { ex: CACHE_TTL_SECONDS });
      cacheStored = true;
    } catch (error) {
      console.error('[КРАЙМ] Проверка завершена, но кэш сохранить не удалось:', error.message);
    }

    return res.status(200).json({
      success: true,
      cached: false,
      cacheStored,
      checkedAt: completedResult.checkedAt,
      alerts: checkResult.alerts,
    });
  } catch (error) {
    console.error('[КРАЙМ] Критическая ошибка:', error.message);
    return res.status(200).json({ success: false, cached: false, error: error.message });
  } finally {
    if (lockAcquired) {
      try {
        await kv.del(lockKey);
      } catch (error) {
        console.warn('[КРАЙМ] Не удалось снять блокировку; она истечёт автоматически:', error.message);
      }
    }
  }
}
