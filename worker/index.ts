/// <reference types="@cloudflare/workers-types" />
import { CHALLENGE_LIFETIME, EnquiryError, MAX_BODY_BYTES, validateAge, validateAttachment, validateFields } from './enquiry-validation.ts';
interface Env { DB: D1Database; BUCKET: R2Bucket; ASSETS: Fetcher }
const HOUR = 60 * 60 * 1000;
const json = (value: unknown, status = 200) => Response.json(value, { status, headers: { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', ...(status === 429 ? { 'Retry-After': '3600' } : {}) } });
async function clientHash(request: Request) {
  // No raw IP is stored. A daily rotating digest supports short-lived abuse limits.
  const source = `${new Date().toISOString().slice(0, 10)}:ran-enquiry:${request.headers.get('cf-connecting-ip') || 'local-preview'}`;
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(source))), b => b.toString(16).padStart(2, '0')).join('');
}
function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  return (!origin || origin === new URL(request.url).origin) && request.headers.get('sec-fetch-site') !== 'cross-site';
}
async function boundedFormData(request: Request) {
  if (!request.headers.get('content-type')?.startsWith('multipart/form-data')) throw new EnquiryError('Please use the enquiry form to submit your request.', 415);
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY_BYTES) throw new EnquiryError('The submitted file is too large.', 413);
  const reader = request.body?.getReader();
  if (!reader) throw new EnquiryError('The enquiry is empty.');
  const parts: Uint8Array[] = []; let bytes = 0;
  try { while (true) { const next = await reader.read(); if (next.done) break; bytes += next.value.byteLength; if (bytes > MAX_BODY_BYTES) { await reader.cancel(); throw new EnquiryError('The submitted file is too large.', 413); } parts.push(next.value); } }
  finally { reader.releaseLock(); }
  const body = new Uint8Array(bytes); let offset = 0;
  for (const part of parts) { body.set(part, offset); offset += part.byteLength; }
  try { return await new Response(body, { headers: { 'Content-Type': request.headers.get('content-type')! } }).formData(); }
  catch { throw new EnquiryError('The form could not be read. Please try again.'); }
}
async function issueToken(request: Request, env: Env) {
  if (!sameOrigin(request)) return json({ ok: false, message: 'Please open the enquiry form on this website.' }, 403);
  const now = Date.now(), hash = await clientHash(request);
  const count = await env.DB.prepare('SELECT COUNT(*) AS total FROM enquiry_challenges WHERE client_hash = ? AND created_at > ?').bind(hash, now - HOUR).first<{ total: number }>();
  if ((count?.total || 0) >= 30) return json({ ok: false, message: 'Too many form requests. Please call or email us, or try again later.' }, 429);
  const token = crypto.randomUUID();
  const issued = await env.DB.batch([env.DB.prepare('DELETE FROM enquiry_challenges WHERE expires_at < ?').bind(now - HOUR), env.DB.prepare('INSERT INTO enquiry_challenges (id, client_hash, created_at, expires_at, used) SELECT ?, ?, ?, ?, 0 WHERE (SELECT COUNT(*) FROM enquiry_challenges WHERE client_hash = ? AND created_at > ?) < 30').bind(token, hash, now, now + CHALLENGE_LIFETIME, hash, now - HOUR)]);
  if (issued[1].meta.changes !== 1) return json({ ok: false, message: 'Too many form requests. Please call or email us, or try again later.' }, 429);
  return json({ ok: true, token, expiresAt: now + CHALLENGE_LIFETIME });
}
async function submitEnquiry(request: Request, env: Env) {
  if (!sameOrigin(request)) throw new EnquiryError('Please send this enquiry from the RAN ENGINEERS website.', 403);
  const data = await boundedFormData(request), fields = validateFields(data), attachment = validateAttachment(data.get('attachment'));
  const token = data.get('formToken'), submissionId = data.get('submissionId');
  if (typeof submissionId !== 'string' || !/^[a-f0-9-]{36}$/i.test(submissionId)) throw new EnquiryError('Please reload this page before submitting.', 400);
  const digest = async (bytes: BufferSource) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
  const attachmentHash = attachment ? await digest(await attachment.file.arrayBuffer()) : '';
  const fingerprint = await digest(new TextEncoder().encode(JSON.stringify({ ...fields, attachment: attachment ? { name: attachment.name, hash: attachmentHash, size: attachment.file.size } : null })));
  type Stored = { reference: string; payload_hash: string; attachment_key: string | null };
  const lookup = () => env.DB.prepare('SELECT reference, payload_hash, attachment_key FROM enquiries WHERE request_key = ?').bind(submissionId).first<Stored>();
  const replay = (stored: Stored) => {
    if (stored.payload_hash !== fingerprint) throw new EnquiryError(`Enquiry ${stored.reference} was already received. These changed details have not been sent. Please contact us with that reference to amend your requirement.`, 409, 'ALREADY_RECEIVED_CHANGED');
    return json({ ok: true, enquiryId: stored.reference });
  };
  const previous = await lookup();
  if (previous) return replay(previous);
  if (typeof token !== 'string' || !/^[a-f0-9-]{36}$/i.test(token)) throw new EnquiryError('Please refresh the form session and try again.', 409, 'SESSION_EXPIRED');
  const now = Date.now(), hash = await clientHash(request);
  const challenge = await env.DB.prepare('SELECT created_at, expires_at, client_hash, used FROM enquiry_challenges WHERE id = ?').bind(token).first<{ created_at: number; expires_at: number; client_hash: string; used: number }>();
  if (!challenge || challenge.client_hash !== hash) throw new EnquiryError('Your form session has expired. Please submit again to refresh it.', 409, 'SESSION_EXPIRED');
  if (challenge.used) throw new EnquiryError('Please submit again to refresh your form session.', 409, 'SESSION_EXPIRED');
  validateAge(challenge.created_at, challenge.expires_at, now);
  const count = await env.DB.prepare('SELECT COUNT(*) AS total FROM enquiries WHERE client_hash = ? AND received_at > ?').bind(hash, now - HOUR).first<{ total: number }>();
  if ((count?.total || 0) >= 5) throw new EnquiryError('Several enquiries have already been received from this connection. Please call or email us for further requirements.', 429);
  const id = crypto.randomUUID(), reference = `RAN-${new Date(now).toISOString().slice(0, 10).replaceAll('-', '')}-${id.slice(0, 8).toUpperCase()}`;
  const attachmentKey = attachment ? `enquiries/${id}/${attachment.name}` : null;
  try {
    if (attachment && attachmentKey) await env.BUCKET.put(attachmentKey, attachment.file.stream(), { httpMetadata: { contentType: attachment.contentType, contentDisposition: 'attachment' }, customMetadata: { enquiry: reference } });
    const result = await env.DB.batch([
      env.DB.prepare('INSERT INTO enquiries (id, reference, request_key, payload_hash, received_at, full_name, company, phone, email, requirement, location, quantity, message, consent_version, attachment_key, attachment_name, attachment_type, attachment_size, client_hash) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE EXISTS (SELECT 1 FROM enquiry_challenges WHERE id = ? AND used = 0) AND (SELECT COUNT(*) FROM enquiries WHERE client_hash = ? AND received_at > ?) < 5').bind(id, reference, submissionId, fingerprint, now, fields.fullName, fields.company, fields.phone, fields.email, fields.requirement, fields.location, fields.quantity, fields.message, '2026-11', attachmentKey, attachment?.name || null, attachment?.contentType || null, attachment?.file.size || null, hash, token, hash, now - HOUR),
      env.DB.prepare('UPDATE enquiry_challenges SET used = 1 WHERE id = ? AND EXISTS (SELECT 1 FROM enquiries WHERE id = ?)').bind(token, id),
    ]);
    if (result[0].meta.changes !== 1) {
      const winner = await lookup();
      if (attachmentKey && winner?.attachment_key !== attachmentKey) await env.BUCKET.delete(attachmentKey);
      if (winner) return replay(winner);
      const limit = await env.DB.prepare('SELECT COUNT(*) AS total FROM enquiries WHERE client_hash = ? AND received_at > ?').bind(hash, now - HOUR).first<{ total: number }>();
      if ((limit?.total || 0) >= 5) throw new EnquiryError('Several enquiries have already been received from this connection. Please call or email us for further requirements.', 429);
      throw new EnquiryError('Please submit again to refresh your form session.', 409, 'SESSION_EXPIRED');
    }
  } catch (error) {
    // Reconcile an uncertain database acknowledgement before touching its attachment.
    // A storage outage may leave an unreferenced object; it must never erase a saved lead's file.
    const winner = await lookup().catch(() => undefined);
    if (winner) {
      if (attachmentKey && winner.attachment_key !== attachmentKey) await env.BUCKET.delete(attachmentKey).catch(() => {});
      return replay(winner);
    }
    throw error;
  }
  return json({ ok: true, enquiryId: reference }, 201);
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const pathname = new URL(request.url).pathname;
    try {
      if (pathname === '/api/enquiry-token') return request.method === 'GET' ? await issueToken(request, env) : json({ ok: false, message: 'Method not allowed.' }, 405);
      if (pathname === '/api/enquiries') return request.method === 'POST' ? await submitEnquiry(request, env) : json({ ok: false, message: 'Enquiries are private records.' }, 405);
      if (pathname.startsWith('/api/')) return json({ ok: false, message: 'Endpoint not found.' }, 404);
      const response = await env.ASSETS.fetch(request);
      if (response.status !== 404 || !request.headers.get('accept')?.includes('text/html')) return response;
      const fallback = await env.ASSETS.fetch(new Request(new URL('/404', request.url), request));
      return new Response(fallback.body, { status: 404, headers: fallback.headers });
    } catch (error) {
      if (error instanceof EnquiryError) return json({ ok: false, message: error.message, code: error.code }, error.status);
      console.error('Enquiry service operation failed:', error instanceof Error ? error.name : 'UnknownError');
      return json({ ok: false, message: 'Receipt could not be confirmed because the enquiry service is temporarily unavailable. Your details remain in this form. Please retry or call +91 98246 21034.' }, 503);
    }
  },
};
