import test from 'node:test';
import assert from 'node:assert/strict';
import { EnquiryError, validateFields, validateAttachment, validateAge, MAX_ATTACHMENT_BYTES } from '../worker/enquiry-validation.ts';
const valid = () => { const form = new FormData(); Object.entries({ fullName: 'Quality Review', company: 'Website test', email: 'qa@example.invalid', phone: '+91 98246 21034', requirement: 'Dam Electrical & Mechanical Works', message: 'Automated validation test. No follow-up is required.', consent: 'agreed', website: '' }).forEach(([key, value]) => form.set(key, value)); return form; };
test('accepts legitimate enquiry details and preserves exact text', () => assert.equal(validateFields(valid()).requirement, 'Dam Electrical & Mechanical Works'));
test('rejects missing consent, invalid phone/email, oversized message and honeypot', () => {
  for (const [key, value] of [['consent', ''], ['phone', '123'], ['email', 'not-an-email'], ['message', 'x'.repeat(6001)], ['website', 'spam.example']]) { const form = valid(); form.set(key, value); assert.throws(() => validateFields(form), EnquiryError); }
});
test('allows permitted drawings and rejects executable names and oversized files', () => {
  assert.equal(validateAttachment(new File(['drawing'], 'drawing.dwg')).name, 'drawing.dwg');
  assert.throws(() => validateAttachment(new File(['test'], 'script.exe')), EnquiryError);
  assert.throws(() => validateAttachment(new File([new Uint8Array(MAX_ATTACHMENT_BYTES + 1)], 'drawing.pdf')), EnquiryError);
});
test('enforces minimum review time and challenge expiry', () => {
  assert.throws(() => validateAge(10000, 20000, 11000), EnquiryError);
  assert.throws(() => validateAge(10000, 20000, 20001), EnquiryError);
  assert.doesNotThrow(() => validateAge(10000, 20000, 13000));
});
