export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export const MAX_BODY_BYTES = MAX_ATTACHMENT_BYTES + 64 * 1024;
export const CHALLENGE_LIFETIME = 20 * 60 * 1000;
export const MIN_FORM_AGE = 1500;
export class EnquiryError extends Error {
  status: number;
  code: string;
  constructor(message: string, status = 400, code = 'INVALID_REQUEST') { super(message); this.status = status; this.code = code; }
}
export function validateFields(data: FormData) {
  const field = (key: string, min: number, max: number) => {
    const raw = data.get(key), value = typeof raw === 'string' ? raw.trim() : '';
    if (value.length < min || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new EnquiryError(`Please check the ${key === 'fullName' ? 'name' : key} field.`);
    return value;
  };
  if (field('website', 0, 200)) throw new EnquiryError('This submission could not be accepted. Please use the phone or email details above.');
  const fullName = field('fullName', 2, 120), company = field('company', 0, 160), email = field('email', 3, 180), phone = field('phone', 7, 22);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new EnquiryError('Please enter a valid email address.');
  if (!/^[+\d() .-]+$/.test(phone) || !/^[0-9]{7,15}$/.test(phone.replace(/\D/g, ''))) throw new EnquiryError('Please enter a valid phone number with 7–15 digits.');
  if (data.get('consent') !== 'agreed') throw new EnquiryError('Please confirm that we may contact you about this enquiry.');
  return { fullName, company, email, phone, requirement: field('requirement', 2, 200), location: field('location', 0, 180), quantity: field('quantity', 0, 240), message: field('message', 10, 6000) };
}
export function validateAttachment(value: FormDataEntryValue | null) {
  if (!value || typeof value === 'string' || value.size === 0) return null;
  if (value.size > MAX_ATTACHMENT_BYTES) throw new EnquiryError('The attachment must be 10 MB or smaller.', 413);
  if (!/\.(pdf|png|jpe?g|dwg|dxf)$/i.test(value.name)) throw new EnquiryError('Please attach a PDF, JPG, PNG, DWG or DXF file.');
  return { file: value, name: value.name.split(/[\\/]/).pop()!.replace(/[\u0000-\u001f\u007f]/g, '').slice(-180), contentType: 'application/octet-stream' };
}
export function validateAge(createdAt: number, expiresAt: number, now: number) {
  if (now < createdAt || now - createdAt < MIN_FORM_AGE) throw new EnquiryError('Please take a moment to review your details, then submit again.');
  if (now > expiresAt) throw new EnquiryError('Your form session has expired. Please submit again to refresh it.', 409, 'SESSION_EXPIRED');
}
