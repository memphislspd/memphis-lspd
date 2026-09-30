// ============================================
// ЕДИНЫЙ КОНФИГ ВСЕХ ОТДЕЛОВ LSPD
// ============================================
// 
// Здесь хранятся все данные об отделах:
// - id (используется в коде)
// - name (полное название)
// - emoji (иконка)
// - roleId / roleId2 (роли для пинга в Discord)
//
// При добавлении нового отдела — добавь строку сюда,
// и он автоматически появится во ВСЕХ формах.
// ============================================

export const DEPARTMENTS = [
  { id: 'af',    name: 'AF',    emoji: '✈️', roleId: '1514695692520525834', roleId2: '1541128485089837136' },
  { id: 'iad',   name: 'IAD',   emoji: '⚖️', roleId: '1514608894700159139', roleId2: '1541128640140550194' },
  { id: 'swat',  name: 'SWAT',  emoji: '🛡️', roleId: '1514608894679191601', roleId2: '1535279144102006784' },
  { id: 'pai',   name: 'PAI',   emoji: '🎓', roleId: '1514608894679191598', roleId2: '1541129110623879249' },
  { id: 'pa',    name: 'PA',    emoji: '🎓', roleId: '1514608894679191598', roleId2: '1541129110623879249' },
  { id: 'alpha', name: 'ALPHA', emoji: '💥', roleId: '1553131243967881226', roleId2: '1553131156143210506' },
  { id: 'dvd',   name: 'DVD',   emoji: '🚗', roleId: '1514608894679191600', roleId2: '1541104206184845372' },
  { id: 'db',    name: 'DB',    emoji: '🕵️', roleId: '1514608894679191599', roleId2: '1541129158095020074' },
  { id: 'k9',    name: 'K9',    emoji: '🐕', roleId: '1514695474362450093', roleId2: '1541105887408820224' },
  { id: 'cpd',   name: 'CPD',   emoji: '🚔', roleId: '1514695305633992706', roleId2: '1541104610935177406' },
  { id: 'halt',  name: 'HALT',  emoji: '🚁', roleId: '1514695733146554558', roleId2: '1541129314257346630' },
  { id: 'ted',   name: 'TED',   emoji: '🔫', roleId: '1541117825169752175', roleId2: '1541166789822648354' },
  { id: 'srt',   name: 'SRT',   emoji: '🛡️', roleId: '1541638981865705502', roleId2: '1541638846242881606' },
  { id: 'nred',  name: 'NRED',  emoji: '🚨', roleId: '1541135772864880730', roleId2: '1541137871379898451' },
  { id: 'med',   name: 'MED',   emoji: '🏥', roleId: '1541133627772117032', roleId2: '1541110783885443092' }
];

// Отделы, куда НЕЛЬЗЯ переводиться (академия, стажёры и т.п.)
export const DEPARTMENTS_WITHOUT_TRANSFER = ['pa'];

// Отделы, доступные для перевода
export const TRANSFER_DEPARTMENTS = DEPARTMENTS.filter(
  d => !DEPARTMENTS_WITHOUT_TRANSFER.includes(d.id)
);

// Получить отдел по ID
export function getDepartment(id) {
  return DEPARTMENTS.find(d => d.id === id);
}

// Получить вебхук для отчётов отдела (только на сервере)
export function getReportWebhook(id) {
  if (!id) return null;
  return process.env['WEBHOOK_REPORT_' + id.toUpperCase()];
}

// Получить вебхук для переводов в отдел (только на сервере)
export function getTransferWebhook(id) {
  if (!id) return null;
  return process.env['WEBHOOK_TRANSFER_' + id.toUpperCase()];
}

// Получить массив упоминаний ролей для пинга
export function getRoleMentions(id) {
  const dept = getDepartment(id);
  if (!dept) return '';
  let mentions = '';
  if (dept.roleId) mentions += `<@&${dept.roleId}> `;
  if (dept.roleId2) mentions += `<@&${dept.roleId2}> `;
  return mentions.trim();
}
