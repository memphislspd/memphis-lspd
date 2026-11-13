import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPassDisplayStatus,
  getPassStatus,
  isValidDate,
  normalizePass,
  validatePass
} from '../lib/pass-utils.mjs';

const validPass = {
  name: 'Test User',
  staticId: '12345',
  passNumber: 'PASS-001',
  issueDate: '2026-11-01',
  validFrom: '2026-11-01',
  validUntil: '2026-11-30',
  link: ''
};

test('accepts real ISO calendar dates and leap days', () => {
  assert.equal(isValidDate('2026-11-13'), true);
  assert.equal(isValidDate('2024-02-29'), true);
});

test('rejects malformed and impossible calendar dates', () => {
  for (const value of ['', null, 20261113, '13.11.2026', '2026-2-03', '2026-02-29', '2026-11-31']) {
    assert.equal(isValidDate(value), false, `Expected invalid date: ${String(value)}`);
  }
});

test('keeps the final validity date inclusive', () => {
  assert.equal(getPassStatus(validPass, '2026-11-30').status, 'active');
  assert.equal(getPassStatus(validPass, '2026-12-01').status, 'expired');
});

test('marks a pass as pending before its start date', () => {
  assert.equal(getPassStatus({ ...validPass, validFrom: '2026-11-14' }, '2026-11-13').status, 'pending');
});

test('manual revocation takes precedence over date status', () => {
  assert.equal(getPassStatus({ ...validPass, revokedAt: '2026-11-10T12:00:00.000Z' }, '2026-11-13').status, 'revoked');
});

test('legacy passes without a validity period remain unspecified', () => {
  assert.equal(getPassStatus({ name: 'Legacy' }, '2026-11-13').status, 'unspecified');
});

test('interface status uses the same shared status calculation', () => {
  assert.deepEqual(getPassDisplayStatus(validPass, '2026-11-13'), {
    kind: 'active',
    label: 'ДЕЙСТВУЕТ',
    reason: 'Пропуск действителен'
  });
});

test('normalizes submitted pass fields to trimmed strings', () => {
  assert.deepEqual(normalizePass({
    name: '  Test User  ',
    staticId: 12345,
    passNumber: ' PASS-001 ',
    issueDate: ' 2026-11-01 '
  }), {
    name: 'Test User',
    staticId: '12345',
    passNumber: 'PASS-001',
    issueDate: '2026-11-01',
    validFrom: '',
    validUntil: '',
    link: ''
  });
});

test('accepts a valid pass and optional HTTP links', () => {
  assert.equal(validatePass(validPass), null);
  assert.equal(validatePass({ ...validPass, link: 'https://example.com/pass/1' }), null);
  assert.equal(validatePass({ ...validPass, link: 'http://example.com/pass/1' }), null);
});

test('rejects missing required fields and invalid dates', () => {
  assert.match(validatePass({ ...validPass, name: '' }), /Заполните имя/);
  assert.match(validatePass({ ...validPass, issueDate: '2026-02-29' }), /дату выдачи/);
  assert.match(validatePass({ ...validPass, validFrom: '2026-12-01' }), /корректные даты/);
});

test('rejects reversed validity periods', () => {
  assert.match(validatePass({ ...validPass, validFrom: '2026-12-01', validUntil: '2026-11-30' }), /не может быть позже/);
});

test('rejects unsafe URL schemes and overlong links', () => {
  assert.match(validatePass({ ...validPass, link: 'javascript:alert(1)' }), /HTTP или HTTPS/);
  assert.match(validatePass({ ...validPass, link: 'https://' + 'a'.repeat(2048) }), /слишком длинная/);
});
