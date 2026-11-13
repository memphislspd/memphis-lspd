// pages/api/submit.js
import { verifyToken } from '../../lib/discord';
import { isBlacklisted, addToBlacklist } from '../../lib/blacklist';
import { checkSpam } from '../../lib/antispam';
import { kv } from '@vercel/kv';
import { recordSubmissionHistory } from '../../lib/submission-history';
import { 
  getDepartment, 
  getReportWebhook, 
  getTransferWebhook, 
  getRoleMentions,
  TRANSFER_DEPARTMENTS
} from '../../lib/departments';

const WHITELIST = ['200102286473691139'];

const GLOBAL_RATE_LIMIT_SCRIPT = `
if redis.call('EXISTS', KEYS[2]) == 1 then
  local ttl = redis.call('TTL', KEYS[2])
  if ttl < 1 then ttl = 3600 end
  return {1, ttl}
end

local count = redis.call('INCR', KEYS[1])
redis.call('EXPIRE', KEYS[1], 20)

if count > 10 then
  redis.call('SET', KEYS[2], '1', 'EX', 3600)
  redis.call('DEL', KEYS[1])
  return {1, 3600}
end

return {0, count}
`;

async function rejectSubmission(res, user, type, formData, leaveType, statusCode, message) {
  await recordSubmissionHistory(user.id, {
    type,
    title: getFormTitle(type, formData?.department, formData?.targetDepartment, leaveType),
    status: 'not_sent',
  });
  return res.status(statusCode).json({ error: message });
}

const webhooks = {
  promotion: process.env.WEBHOOK_PROMOTION,
  highrank: process.env.WEBHOOK_HIGH_RANK_REPORT,
  resignation: process.env.WEBHOOK_RESIGNATION,
  reinstatement: process.env.WEBHOOK_REINSTATEMENT,
  'transfer-to-lspd': process.env.WEBHOOK_TRANSFER_TO_LSPD,
  hiring: process.env.WEBHOOK_HIRING,
  'weapon-request': process.env.WEBHOOK_WEAPON_REQUEST,
  leave: process.env.WEBHOOK_LEAVE,
  premium: process.env.WEBHOOK_PREMIUM,
  complaintPublic: process.env.WEBHOOK_COMPLAINT_PUBLIC,
  complaintPrivate: process.env.WEBHOOK_COMPLAINT_PRIVATE
};


const RANK_RANGE_OPTIONS = [
  '1-2 ранг', '2-3 ранг', '3-4 ранг', '4-5 ранг', '5-6 ранг',
  '6-7 ранг', '7-8 ранг', '8-9 ранг', '9-10 ранг', '10-11 ранг',
  '11-12 ранг', '12-13 ранг', '13-14 ранг', '14-15 ранг'
];
const WEAPON_OPTIONS = [
  { value: 'drone', label: '🚁 Дрон', departments: ['k9', 'db'] },
  { value: 'defik', label: '🛡️ Дефибриллятор' },
  { value: 'combat-mg', label: '🔫 Combat MG' },
  { value: 'combat-mg-mk2', label: '🔫 Combat MG Mk2' },
  { value: 'marksman-rifle-mk2', label: '🎯 Marksman Rifle Mk2' },
  { value: 'sniper-rifle', label: '🎯 Sniper Rifle' },
  { value: 'heavy-sniper', label: '🎯 Heavy Sniper' },
  { value: 'heavy-sniper-mk2', label: '🎯 Heavy Sniper Mk2' },
  { value: 'precision-rifle', label: '🎯 Precision Rifle' }
];

function hasText(data, key) {
  return typeof data[key] === 'string' && data[key].trim().length > 0;
}

function validateSubmission(type, data, leaveType) {
  const required = {
    report: ['fullName', 'department', 'currentRank', 'targetRank', 'workLinks'],
    transfer: ['fullName', 'rank', 'currentDepartment', 'targetDepartment', 'reason'],
    highrank: ['fullName', 'rankRange', 'workLink'],
    resignation: ['fullName', 'screenshot'],
    reinstatement: ['fullName', 'rankAtDismissal', 'rankProof', 'wasWarned'],
    'transfer-to-lspd': ['fullName', 'approvalProof', 'rankProof'],
    hiring: ['fullName', 'age', 'experience', 'lawKnowledge', 'passport', 'militaryId', 'medical'],
    'weapon-request': ['fullName', 'department', 'rank', 'weapon'],
    premium: ['department', 'participants'],
    complaint: ['complainantName', 'targetName', 'incidentDate', 'description', 'evidence'],
    leave: ['fullName', 'department', 'reason', 'startDate', 'endDate'],
    promotion: ['fullName', 'rankRange', 'reportLink']
  };

  for (const key of required[type] || []) {
    if (!hasText(data, key)) return 'Заполните все обязательные поля.';
  }

  const limits = {
    fullName: 120, complainantName: 120, targetName: 120, incidentDate: 80,
    rank: 40, rankRange: 30, age: 10, department: 20,
    currentDepartment: 20, targetDepartment: 20, participants: 900,
    comment: 900, description: 1000, evidence: 1000
  };
  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== 'string') return 'Некорректный формат данных формы.';
    const max = limits[key] || 1000;
    if (value.length > max) return `Поле «${key}» слишком длинное (максимум ${max} символов).`;
  }

  const validRank = value => /^[1-9]$|^1[0-5]$/.test(value || '');
  if (type === 'report') {
    if (!getDepartment(data.department)) return 'Выберите существующий отдел.';
    if (!validRank(data.currentRank) || !validRank(data.targetRank)) return 'Выберите корректный ранг.';
    if (data.targetRank === '10' && data.isInstructor !== 'yes') {
      return 'Для повышения на 10 ранг необходимо быть назначенным инструктором.';
    }
  }
  if (type === 'transfer') {
    if (!getDepartment(data.currentDepartment) || !getDepartment(data.targetDepartment)) return 'Выберите существующий отдел.';
    if (data.currentDepartment === data.targetDepartment) return 'Нельзя перевестись в тот же отдел.';
    if (!TRANSFER_DEPARTMENTS.some(dept => dept.id === data.targetDepartment)) return 'В выбранный отдел перевод недоступен.';
    if (!validRank(data.rank)) return 'Выберите корректный ранг.';
    if (data.targetDepartment === 'db') {
      for (const key of ['dbWhatIs', 'dbExperience', 'dbExamples', 'dbServers', 'dbKnowledge', 'dbLawKnowledge']) {
        if (!hasText(data, key)) return 'Заполните дополнительные вопросы для DB.';
      }
    }
    if (data.targetDepartment === 'swat') {
      if (!hasText(data, 'swatShooting') || !hasText(data, 'swatRollback')) return 'Заполните дополнительные вопросы для SWAT.';
    }
  }
  if (type === 'highrank' || type === 'promotion') {
    if (!RANK_RANGE_OPTIONS.includes(data.rankRange)) return 'Выберите корректный диапазон рангов.';
  }
  if (type === 'reinstatement') {
    if (!validRank(data.rankAtDismissal)) return 'Укажите корректный ранг на момент увольнения.';
    if (!['yes', 'no'].includes(data.wasWarned)) return 'Укажите, было ли увольнение после Ban/Warn.';
    if (data.wasWarned === 'yes' && !hasText(data, 'stateFractionsProof')) return 'Добавьте доказательство одобрения State Fractions.';
  }
  if (type === 'leave') {
    if (!['ooc', 'ic'].includes(leaveType)) return 'Выберите тип отпуска.';
    if (!getDepartment(data.department)) return 'Выберите существующий отдел.';
  }
  if (type === 'weapon-request') {
    if (!getDepartment(data.department) || !validRank(data.rank)) return 'Выберите существующий отдел и корректный ранг.';
    const weapon = WEAPON_OPTIONS.find(item => item.value === data.weapon || item.label === data.weapon);
    if (!weapon) return 'Выберите оружие из списка.';
    if (weapon.departments && !weapon.departments.includes(data.department)) return 'Дрон доступен только для отделов K9 и DB.';
  }
  if (type === 'hiring') {
    if (!/^(10|[1-9])$/.test(data.lawKnowledge)) return 'Оценка знания законов должна быть от 1 до 10.';
  }
  if (type === 'premium') {
    if (!getDepartment(data.department)) return 'Выберите существующий отдел.';
    const rows = data.participants.split('\n').map(line => line.trim()).filter(Boolean);
    if (!rows.length || rows.length > 10) return 'В заявке должно быть от 1 до 10 участников.';
    for (const line of rows) {
      const parts = line.split('|').map(part => part.trim());
      if (parts.length !== 4 || parts.some(part => !part)) return 'Проверьте данные участников: имя, ранг, Static ID и количество недель.';
    }
  }
  if (type === 'complaint') {
    const rawLinks = data.evidence.match(/https?:\/\/[^\s<>()]+/g) || [];
    if (!rawLinks.length) return 'В доказательствах должна быть хотя бы одна ссылка.';
    if (rawLinks.length > 8) return 'Можно добавить не более 8 ссылок на доказательства.';
    const allowedHosts = ['imgur.com', 'yapx.ru', 'youtube.com', 'youtu.be', 'medal.tv', 'streamable.com', 'discord.com', 'cdn.discordapp.com', 'ibb.co', 'prnt.sc'];
    for (const raw of rawLinks) {
      try {
        const cleaned = raw.replace(/[),.!?;:]+$/, '');
        const parsed = new URL(cleaned);
        const host = parsed.hostname.toLowerCase();
        const allowed = ['http:', 'https:'].includes(parsed.protocol) &&
          allowedHosts.some(domain => host === domain || host.endsWith('.' + domain));
        if (!allowed) return 'Ссылка не разрешена. Используйте imgur, yapx, YouTube, Medal, Streamable, Discord, ibb или prnt.sc.';
      } catch {
        return 'Одна из ссылок на доказательства имеет некорректный формат.';
      }
    }
  }

  return null;
}

function validateEmbed(embed) {
  const fields = Array.isArray(embed.fields) ? embed.fields : [];
  if (fields.length > 25) return 'Слишком много полей для отправки в Discord.';
  let total = (embed.title || '').length + (embed.description || '').length +
    (embed.footer?.text || '').length + (embed.author?.name || '').length;
  for (const field of fields) {
    if (!field.name || field.name.length > 256) return 'Название одного из полей превышает лимит Discord.';
    if (!field.value || field.value.length > 1024) return 'Одно из полей превышает лимит Discord (1024 символа).';
    total += field.name.length + field.value.length;
  }
  if (total > 6000) return 'Объём текста превышает лимит Discord для одного embed.';
  return null;
}

async function sendToDiscord(webhookUrl, data, retries = 3) {
  let lastError = null;
  const url = data.thread_id ? `${webhookUrl}?thread_id=${data.thread_id}` : webhookUrl;
  const { thread_id, ...payload } = data;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) return { success: true };
      if (res.status === 429) { await new Promise(r => setTimeout(r, (parseInt(res.headers.get('Retry-After')) || 5) * 1000)); continue; }
      return { success: false, error: await res.text() };
    } catch (e) { lastError = e; if (i < retries - 1) await new Promise(r => setTimeout(r, 1000 * (i + 1))); }
  }
  return { success: false, error: lastError?.message };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { type, leaveType, ...formData } = req.body || {};
  const validTypes = new Set(['report', 'transfer', 'highrank', 'resignation', 'reinstatement', 'transfer-to-lspd', 'hiring', 'weapon-request', 'premium', 'complaint', 'leave', 'promotion']);
  if (!validTypes.has(type)) return res.status(400).json({ error: 'Неизвестный тип заявления' });

  const validationError = validateSubmission(type, formData, leaveType);
  if (validationError) return rejectSubmission(res, user, type, formData, leaveType, 400, validationError);

  const employeeOnlyTypes = new Set(['report', 'transfer', 'resignation', 'weapon-request', 'leave', 'promotion']);
  const userRoles = Array.isArray(user.roles) ? user.roles : [];
  const STAFF_ROLE_ID = '1552313180041121802';
  const HIGH_RANK_ROLE_ID = '1514608894679191597';
  if (employeeOnlyTypes.has(type) && !userRoles.includes(STAFF_ROLE_ID)) {
    return rejectSubmission(res, user, type, formData, leaveType, 403, 'Для подачи этой формы требуется роль сотрудника LSPD');
  }
  if (type === 'highrank' && !userRoles.includes(HIGH_RANK_ROLE_ID)) {
    return rejectSubmission(res, user, type, formData, leaveType, 403, 'Для подачи отчёта требуется роль старшего состава');
  }

  const ip = req.headers['x-vercel-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  const isWhitelisted = WHITELIST.includes(user.id);

  if (!isWhitelisted) {
    try {
      const globalLimit = await kv.eval(
        GLOBAL_RATE_LIMIT_SCRIPT,
        ['lspd:global:requests', 'lspd:global:locked'],
        []
      );
      if (!Array.isArray(globalLimit) || globalLimit.length < 2) {
        throw new Error('Global submission limit returned an invalid storage response');
      }
      const [isLocked, ttl] = globalLimit.map(Number);
      if (isLocked) {
        return rejectSubmission(
          res, user, type, formData, leaveType, 429,
          `🚫 Сайт заблокирован. Подождите ${Math.ceil((ttl > 0 ? ttl : 3600) / 60)} мин.`
        );
      }

      if (await isBlacklisted(user.id, ip)) {
        return rejectSubmission(res, user, type, formData, leaveType, 403, '⛔ Вы заблокированы.');
      }

      const spamCheck = await checkSpam(user.id, ip);
      if (spamCheck.isSpam) {
        if (spamCheck.ban) await addToBlacklist(user.id, user.username, spamCheck.reason, ip);
        return rejectSubmission(res, user, type, formData, leaveType, 429, spamCheck.message);
      }
    } catch (error) {
      console.error('Submission protection storage failed:', error);
      return rejectSubmission(
        res, user, type, formData, leaveType, 503,
        'Защита отправки временно недоступна. Попробуйте позже.'
      );
    }
  }

  const department = formData.department;
  const targetDepartment = formData.targetDepartment;

  let webhookUrl, roleMentions = '', threadId = null;

  if (type === 'report') {
    const dept = getDepartment(department);
    if (!dept) return rejectSubmission(res, user, type, formData, leaveType, 400, 'Выберите отдел');
    webhookUrl = getReportWebhook(department);
    if (!webhookUrl) return rejectSubmission(res, user, type, formData, leaveType, 500, 'Вебхук не настроен');
    roleMentions = getRoleMentions(department);
  } else if (type === 'transfer') {
    webhookUrl = getTransferWebhook(targetDepartment);
    if (!webhookUrl) return rejectSubmission(res, user, type, formData, leaveType, 500, 'Вебхук не настроен');
    roleMentions = getRoleMentions(targetDepartment);
  } else if (type === 'highrank') { webhookUrl = webhooks.highrank; roleMentions = '<@&1514608894700159142> <@&1514690313233371226>'; }
  else if (type === 'resignation') { webhookUrl = webhooks.resignation; roleMentions = '<@&1514608894679191597>'; }
  else if (type === 'reinstatement') { webhookUrl = webhooks.reinstatement; roleMentions = '<@&1514690313233371226> <@&1514608894679191598>'; }
  else if (type === 'transfer-to-lspd') { webhookUrl = webhooks['transfer-to-lspd']; roleMentions = '<@&1514690313233371226> <@&1514608894700159142>'; }
  else if (type === 'hiring') { webhookUrl = webhooks.hiring; roleMentions = '<@&1514608894666735724> <@&1514608894679191598> <@&1541129110623879249>'; }
  else if (type === 'weapon-request') { webhookUrl = webhooks['weapon-request']; roleMentions = '<@&1514690313233371226> <@&1514608894700159142>'; }
  else if (type === 'premium') { webhookUrl = webhooks.premium; roleMentions = ''; }
  else if (type === 'complaint') { webhookUrl = webhooks.complaintPrivate; roleMentions = '<@&1514608894679191592>'; }
  else if (type === 'leave') {
    webhookUrl = webhooks.leave;
    roleMentions = getRoleMentions(department);
    threadId = leaveType === 'ooc' ? '1541113530743390288' : '1541113565505781891';
  } else { webhookUrl = webhooks.promotion; roleMentions = '<@&1514608894679191597>'; }
  if (!webhookUrl) return rejectSubmission(res, user, type, formData, leaveType, 500, 'Вебхук не настроен');

  if (!isWhitelisted) {
    const ipCount = await kv.get(`lspd:spam:ip:${ip}`);
    if (ipCount && parseInt(ipCount) >= 6) return rejectSubmission(res, user, type, formData, leaveType, 429, '🚫 Слишком много с IP.');
  }

  const embed = {
    title: getFormTitle(type, department, targetDepartment, leaveType),
    color: getFormColor(type),
    author: { name: user.username, icon_url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` },
    fields: buildFields(type, department, targetDepartment, formData, leaveType, user.id),
    footer: { text: 'LSPD Forms • ' + new Date().toLocaleDateString('ru-RU') },
    timestamp: new Date().toISOString()
  };
  const embedError = validateEmbed(embed);
  if (embedError) return rejectSubmission(res, user, type, formData, leaveType, 400, embedError);

  // Приватная запись — каноническая копия жалобы. Публичная сводка отправляется после неё.
  const result = await sendToDiscord(webhookUrl, {
    content: roleMentions.trim() || undefined,
    embeds: [embed],
    username: 'LSPD Forms',
    avatar_url: 'https://i.imgur.com/AfFp7pu.png',
    ...(threadId ? { thread_id: threadId } : {})
  });

  if (!result.success) {
    return rejectSubmission(res, user, type, formData, leaveType, 502, `Не удалось отправить: ${result.error || 'ошибка Discord'}`);
  }

  // Discord подтвердил доставку основного сообщения — фиксируем успех сразу.
  await recordSubmissionHistory(user.id, { type, title: embed.title, status: 'sent' });

  let publicWarning = null;
  if (type === 'complaint') {
    if (!webhooks.complaintPublic) {
      publicWarning = 'Жалоба доставлена в закрытый канал, но публичный вебхук не настроен.';
    } else {
      const publicEmbed = {
        title: '🚨 ЖАЛОБА НА СОТРУДНИКА',
        color: 0xFF0000,
        fields: [
          { name: '👤 На кого', value: formData.targetName, inline: false },
          { name: '📅 Когда', value: formData.incidentDate, inline: false },
          { name: '📝 Описание', value: formData.description.slice(0, 1024), inline: false }
        ],
        footer: { text: 'LSPD Forms • ' + new Date().toLocaleDateString('ru-RU') },
        timestamp: new Date().toISOString()
      };
      const publicResult = await sendToDiscord(webhooks.complaintPublic, {
        embeds: [publicEmbed],
        username: 'LSPD Forms',
        avatar_url: 'https://i.imgur.com/AfFp7pu.png'
      });
      if (!publicResult.success) {
        publicWarning = 'Жалоба сохранена в закрытом канале, но публичная сводка не отправилась. Сообщите администратору.';
      }
    }
  }

  // После успешной отправки в Discord ошибки KV не должны провоцировать повторную отправку той же формы.
  try {
    const today = new Date().toISOString().split('T')[0];
    await kv.incr('lspd:stats:total');
    await kv.incr(`lspd:stats:${today}`);
    const globalRequest = {
      id: Date.now().toString(),
      type: type || 'unknown',
      title: embed.title,
      username: user.username,
      userId: user.id,
      date: new Date().toISOString(),
      processed: false,
      data: formData
    };
    await kv.lpush('lspd:submissions:all', JSON.stringify(globalRequest));
    await kv.ltrim('lspd:submissions:all', 0, 199);
  } catch (storageError) {
    console.error('Submission delivered to Discord, but history storage failed:', storageError);
  }

  res.status(200).json({ success: true, ...(publicWarning ? { warning: publicWarning } : {}) });
}

function getFormTitle(type, department, targetDepartment, leaveType) {
  if (type === 'report') { const d = getDepartment(department); return `📋 Отчёт о повышении • ${d ? d.emoji + ' ' + d.name : 'Отдел'}`; }
  if (type === 'transfer') { const d = getDepartment(targetDepartment); return `🔄 Запрос на перевод в ${d ? d.name : 'Отдел'}`; }
  if (type === 'highrank') return '🌟 Отчёт на повышение (Хай Ранги)';
  if (type === 'resignation') return '🚪 Заявление на увольнение';
  if (type === 'reinstatement') return '🔄 Восстановление в LSPD';
  if (type === 'transfer-to-lspd') return '🏛️ Перевод в LSPD';
  if (type === 'hiring') return '📝 Трудоустройство в LSPD';
  if (type === 'weapon-request') return '🔫 Запрос на спец вооружение';
  if (type === 'premium') return '🎯 Премия';
  if (type === 'complaint') return '🚨 ЖАЛОБА НА СОТРУДНИКА';
  if (type === 'leave') return `🏖️ ${leaveType === 'ooc' ? 'OOC' : 'IC'} Отпуск`;
  return '📈 Запрос на повышение';
}

function getFormColor(type) {
  const c = { promotion:0x4CAF50, transfer:0x2196F3, report:0xFF9800, highrank:0xFF69B4, resignation:0xDC3545, reinstatement:0x9C27B0, 'transfer-to-lspd':0x00BCD4, hiring:0x4CAF50, 'weapon-request':0xFF5722, premium:0xFFD700, complaint:0xFF0000, leave:0x00BCD4 };
  return c[type] || 0x5865F2;
}

function buildFields(type, department, targetDepartment, data, leaveType, userId) {
  const base = [
    { name: '👤 Отправитель', value: `<@${userId}>`, inline: true },
    { name: '🆔 Discord ID', value: userId, inline: true }
  ];

  if (type === 'complaint') {
    return [
      { name: '👤 На кого жалоба', value: data.targetName || '-', inline: false },
      { name: '📅 Дата инцидента', value: data.incidentDate || '-', inline: false },
      { name: '📝 Описание', value: (data.description || '-').slice(0, 1024), inline: false },
      { name: '📸 Доказательства', value: (data.evidence || '-').slice(0, 1024), inline: false },
      { name: '👤 Заявитель', value: data.complainantName || '-', inline: false },
      { name: '🆔 ID заявителя', value: userId, inline: false }
    ];
  }

  if (type === 'premium') {
    const lines = (data.participants || '').split('\n').filter(line => line.trim());
    const rows = lines.map(line => {
      const parts = line.split('|').map(part => part.trim());
      return { name: parts[0] || '-', rank: parts[1] || '-', static: parts[2] || '-', weeks: parts[3] || '-' };
    });

    const names = rows.map(r => r.name).join('\n');
    const ranks = rows.map(r => r.rank).join('\n');
    const statics = rows.map(r => r.static).join('\n');
    const weeks = rows.map(r => r.weeks).join('\n');

    const dept = getDepartment(data.department);

    return [
      { name: '🏢 Отдел', value: dept ? `${dept.emoji} ${dept.name}` : 'Не указан', inline: false },
      { name: '👤 Имена', value: `\`\`\`\n${names}\n\`\`\``, inline: true },
      { name: '⭐ Ранги', value: `\`\`\`\n${ranks}\n\`\`\``, inline: true },
      { name: '🆔 Static ID', value: `\`\`\`\n${statics}\n\`\`\``, inline: true },
      { name: '📅 Недели', value: `\`\`\`\n${weeks}\n\`\`\``, inline: true },
      { name: '📝 Заполнил', value: `<@${userId}>`, inline: false },
      ...base
    ];
  }

  if (type === 'leave') {
    const d = getDepartment(department);
    return [
      { name: '📋 Тип отпуска', value: leaveType === 'ooc' ? '🌍 OOC' : '🎮 IC', inline: false },
      { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '🏢 Отдел', value: d ? d.emoji + ' ' + d.name : (department || 'Не указан'), inline: false },
      { name: '📝 Причина отпуска', value: data.reason || 'Не указано', inline: false },
      { name: '📅 Дата начала', value: data.startDate || 'Не указано', inline: true },
      { name: '📅 Дата окончания', value: data.endDate || 'Не указано', inline: true },
      ...base
    ];
  }

  if (type === 'report') {
    const d = getDepartment(department);
    return [
      { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '🏢 Отдел', value: d ? d.emoji + ' ' + d.name : 'Не указан', inline: false },
      { name: '📌 Текущий ранг', value: data.currentRank || 'Не указан', inline: false },
      { name: '🎯 Целевой ранг', value: data.targetRank || 'Не указан', inline: false },
      { name: '👨‍🏫 Инструктор', value: data.isInstructor === 'yes' ? '✅ Да' : '❌ Нет', inline: false },
      { name: '🔗 Ссылки на работу', value: data.workLinks || 'Не указаны', inline: false },
      ...base
    ];
  }

  if (type === 'promotion') return [
    { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
    { name: '📊 Диапазон рангов', value: data.rankRange || 'Не указано', inline: false },
    { name: '🔗 Ссылка на отчет', value: data.reportLink || 'Не указано', inline: false },
    ...base
  ];

  if (type === 'highrank') return [
    { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
    { name: '📊 Диапазон рангов', value: data.rankRange || 'Не указано', inline: false },
    { name: '🔗 Ссылка на работу', value: data.workLink || 'Не указано', inline: false },
    ...base
  ];

  if (type === 'resignation') return [
    { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
    { name: '📸 Скриншот планшета', value: data.screenshot || 'Не указано', inline: false },
    ...base
  ];

  if (type === 'reinstatement') return [
    { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
    { name: '📌 Ранг на момент увольнения', value: data.rankAtDismissal || 'Не указан', inline: false },
    { name: '📸 Доказательство ранга', value: data.rankProof || 'Не указано', inline: false },
    { name: '⚠️ Уволен после Ban/Warn', value: data.wasWarned === 'yes' ? '✅ Да' : '❌ Нет', inline: false },
    ...(data.wasWarned === 'yes' ? [{ name: '📄 Скрин одобрения State Fractions', value: data.stateFractionsProof || 'Не указано', inline: false }] : []),
    ...base
  ];

  if (type === 'transfer-to-lspd') return [
    { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
    { name: '✅ Одобрение перевода от начальства', value: data.approvalProof || 'Не указано', inline: false },
    { name: '📸 Доказательство ранга', value: data.rankProof || 'Не указано', inline: false },
    ...base
  ];

  if (type === 'hiring') return [
    { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
    { name: '🎂 Возраст (RP)', value: data.age || 'Не указан', inline: false },
    { name: '💼 Опыт работы в гос. структурах', value: data.experience || 'Не указан', inline: false },
    { name: '📚 Знание законов RP', value: (data.lawKnowledge||'?') + '/10', inline: false },
    { name: '🪪 Скриншот паспорта', value: data.passport || 'Не указано', inline: false },
    { name: '🎖️ Скриншот военного билета', value: data.militaryId || 'Не указано', inline: false },
    { name: '🏥 Скриншот мед. справок', value: data.medical || 'Не указано', inline: false },
    ...base
  ];

  if (type === 'weapon-request') {
    const d = getDepartment(data.department);
    return [
      { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '🏢 Отдел', value: d ? d.emoji + ' ' + d.name : (data.department || 'Не указан'), inline: false },
      { name: '📌 Ранг', value: data.rank || 'Не указан', inline: false },
      { name: '🔫 Запрашиваемое оружие', value: data.weapon || 'Не указано', inline: false },
      ...base
    ];
  }

  if (type === 'transfer') {
    const currentDept = getDepartment(data.currentDepartment);
    const targetDept = getDepartment(targetDepartment);
    const f = [
      { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '📌 Ваш ранг', value: data.rank || 'Не указан', inline: false },
      { name: '🏢 Текущий отдел', value: currentDept ? currentDept.emoji + ' ' + currentDept.name : (data.currentDepartment || 'Не указано'), inline: false },
      { name: '🎯 Желаемый отдел', value: targetDept ? targetDept.emoji + ' ' + targetDept.name : (targetDepartment || 'Не указано'), inline: false },
      { name: '📝 Причина перевода', value: data.reason || 'Не указано', inline: false }
    ];

    // === DB ===
    if (targetDepartment === 'db') f.push(
      { name: '📋 Чем занимается DB?', value: data.dbWhatIs || 'Не указано', inline: false },
      { name: '📋 Опыт работы в DB?', value: data.dbExperience || 'Не указано', inline: false },
      { name: '📋 Примеры работ', value: data.dbExamples || 'Не указано', inline: false },
      { name: '📋 Серверы с DB', value: data.dbServers || 'Не указано', inline: false },
      { name: '📋 Знания по работе DB (1-10)', value: (data.dbKnowledge || '?') + '/10', inline: false },
      { name: '📋 Знания по законке (1-10)', value: (data.dbLawKnowledge || '?') + '/10', inline: false }
    );

    // === SWAT ===
    if (targetDepartment === 'swat') f.push(
      { name: '🎯 Уровень тулева и знания механик игры (0/10)', value: (data.swatShooting || '?') + '/10', inline: false },
      { name: '🔫 Откат с ГГ', value: data.swatRollback || 'Не указано', inline: false }
    );

    f.push(...base);
    return f;
  }

  return [...base, ...Object.entries(data).map(([k,v]) => ({ name: k, value: String(v) || 'Не указано', inline: false }))];
}
