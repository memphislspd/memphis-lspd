export function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function getPassStatus(pass, today) {
  if (pass.revokedAt) {
    return { status: 'revoked', statusLabel: 'АННУЛИРОВАН', statusReason: 'Аннулирован администратором' };
  }
  if (pass.validUntil && isValidDate(pass.validUntil) && today > pass.validUntil) {
    return { status: 'expired', statusLabel: 'АННУЛИРОВАН', statusReason: 'Срок действия истёк автоматически' };
  }
  if (pass.validFrom && isValidDate(pass.validFrom) && today < pass.validFrom) {
    return { status: 'pending', statusLabel: 'ЕЩЁ НЕ ДЕЙСТВУЕТ', statusReason: 'Срок действия ещё не начался' };
  }
  if (isValidDate(pass.validFrom) && isValidDate(pass.validUntil)) {
    return { status: 'active', statusLabel: 'ДЕЙСТВУЕТ', statusReason: 'Пропуск действителен' };
  }
  return { status: 'unspecified', statusLabel: 'СРОК НЕ ЗАДАН', statusReason: 'Для этой старой записи не указан период действия' };
}

export function getPassDisplayStatus(pass, today) {
  const status = getPassStatus(pass, today);
  return {
    kind: status.status,
    label: status.statusLabel,
    reason: status.statusReason
  };
}

export function normalizePass(body = {}) {
  return {
    name: String(body.name || '').trim(),
    staticId: String(body.staticId || '').trim(),
    passNumber: String(body.passNumber || '').trim(),
    validFrom: String(body.validFrom || '').trim(),
    validUntil: String(body.validUntil || '').trim(),
    link: String(body.link || '').trim()
  };
}

export function validatePass(pass) {
  if (!pass.name || !pass.staticId || !pass.passNumber) return 'Заполните имя, статик и номер пропуска';
  if (pass.name.length > 120 || pass.staticId.length > 40 || pass.passNumber.length > 40) return 'Проверьте длину полей';
  if (!isValidDate(pass.validFrom) || !isValidDate(pass.validUntil)) return 'Укажите корректные даты начала и окончания действия';
  if (pass.validFrom > pass.validUntil) return 'Дата «ОТ» не может быть позже даты «ДО»';
  if (pass.link) {
    try {
      const url = new URL(pass.link);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') return 'Ссылка должна начинаться с HTTP или HTTPS';
    } catch {
      return 'Укажите корректную ссылку';
    }
    if (pass.link.length > 2048) return 'Ссылка слишком длинная';
  }
  return null;
}
