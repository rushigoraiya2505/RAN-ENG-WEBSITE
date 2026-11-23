import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Paperclip, FileText, X, CheckCircle2, AlertCircle, LoaderCircle, Download, LockKeyhole, Send } from 'lucide-react';
import { products, services } from './data';
import { site } from './site';
import { serviceContent } from './serviceContent';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const EXTENSIONS = /\.(pdf|png|jpe?g|dwg|dxf)$/i;
type Status = { kind: 'idle' | 'sending' | 'error' | 'success' | 'download'; message: string };
type FormSession = { token: string; expiresAt: number; readyAt: number };
let cachedSession: FormSession | null = null;
let pendingSession: Promise<FormSession> | null = null;
function loadFormSession(): Promise<FormSession> {
  if (cachedSession && cachedSession.expiresAt > Date.now() + 5000) return Promise.resolve(cachedSession);
  if (pendingSession) return pendingSession;
  pendingSession = fetch(site.enquiryTokenEndpoint, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(10000) })
    .then(async response => {
      const result = await response.json();
      if (!response.ok || result.ok !== true || !result.token) throw new Error(result.message || 'The enquiry service is temporarily unavailable. Please try again or call us.');
      cachedSession = { token: result.token, expiresAt: result.expiresAt, readyAt: Date.now() + 1600 };
      return cachedSession;
    }).finally(() => { pendingSession = null; });
  return pendingSession;
}
export default function EnquiryForm({ initialRequirement = '', compact = false }: { initialRequirement?: string; compact?: boolean }) {
  const form = useRef<HTMLFormElement>(null), fileInput = useRef<HTMLInputElement>(null), messageBox = useRef<HTMLDivElement>(null);
  const [requirement, setRequirement] = useState(initialRequirement), [file, setFile] = useState<File | null>(null), [fileError, setFileError] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle', message: '' });
  const controller = useRef<AbortController | null>(null);
  const active = useRef(true);
  const submissionId = useRef('');
  useEffect(() => { setRequirement(initialRequirement); }, [initialRequirement]);
  useEffect(() => { active.current = true; loadFormSession().catch(() => {}); return () => { active.current = false; controller.current?.abort(); }; }, []);
  useEffect(() => { if (status.kind === 'error' || status.kind === 'success' || status.kind === 'download') messageBox.current?.focus(); }, [status]);
  const serviceOptions = [...new Set([...serviceContent.map(s => s.title), ...services.map(s => s.title)])];
  const options = [...products.map(p => p.title), ...serviceOptions];
  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = event.target.files?.[0]; setFileError('');
    if (!incoming) { setFile(null); return; }
    if (!EXTENSIONS.test(incoming.name)) { setFileError('Please choose a PDF, JPG, PNG, DWG or DXF file.'); event.target.value = ''; setFile(null); return; }
    if (incoming.size > MAX_FILE_SIZE) { setFileError('This file is too large. Please choose a file under 10 MB.'); event.target.value = ''; setFile(null); return; }
    setFile(incoming);
  };
  const download = () => {
    if (!form.current?.reportValidity() || fileError) return;
    const data = new FormData(form.current);
    const fields = [['Full name', 'fullName'], ['Company', 'company'], ['Email', 'email'], ['Mobile number', 'phone'], ['Requirement', 'requirement'], ['Project location', 'location'], ['Quantity / scope', 'quantity'], ['Message', 'message']];
    const lines = ['RAN ENGINEERS — ENQUIRY DRAFT', 'Prepared locally. This enquiry has NOT been submitted.', '', ...fields.map(([label, key]) => `${label}: ${data.get(key) || 'Not provided'}`), '', `Attachment: ${file ? `${file.name} (not included in this text file; attach separately when sending)` : 'None'}`, '', 'Contact consent: agreed'];
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'RAN-Engineers-Enquiry.txt'; a.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus({ kind: 'download', message: 'Your enquiry draft has been downloaded. It has not been sent. Any selected drawing remains on your device and is not included in the text file.' });
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status.kind === 'sending' || fileError) return;
    if (!site.enquiryEndpoint) { download(); return; }
    setStatus({ kind: 'sending', message: 'Submitting your enquiry…' });
    controller.current = new AbortController();
    const timeout = window.setTimeout(() => controller.current?.abort(), 120000);
    try {
      const endpoint = new URL(site.enquiryEndpoint, window.location.origin);
      if (!['https:', 'http:'].includes(endpoint.protocol) || (window.location.protocol === 'https:' && endpoint.protocol !== 'https:')) throw new Error('The enquiry service is not configured with a secure address. Your enquiry has not been sent.');
      const data = new FormData(form.current!);
      data.delete('attachment'); if (file) data.append('attachment', file);
      const session = await loadFormSession();
      if (Date.now() < session.readyAt) await new Promise(resolve => window.setTimeout(resolve, session.readyAt - Date.now()));
      if (!active.current) return;
      data.set('formToken', session.token);
      if (!submissionId.current) submissionId.current = crypto.randomUUID();
      data.set('submissionId', submissionId.current);
      const response = await fetch(endpoint.href, { method: 'POST', body: data, signal: controller.current.signal, headers: { Accept: 'application/json' } });
      let payload: { ok?: boolean; enquiryId?: string; message?: string; code?: string } = {};
      try { payload = await response.json(); } catch { throw new Error('The service did not confirm receipt. Your details are still here; please check before trying again.'); }
      if (!response.ok || payload.ok !== true || typeof payload.enquiryId !== 'string' || !payload.enquiryId.trim()) {
        if (payload.code === 'SESSION_EXPIRED') { cachedSession = null; loadFormSession().catch(() => {}); }
        throw new Error(payload.message || 'We could not confirm receipt of your enquiry. Your details have been preserved. Please try again or use the contact details above.');
      }
      cachedSession = null;
      setStatus({ kind: 'success', message: `Your enquiry has been received. Reference: ${payload.enquiryId}. Please keep this reference for follow-up.` });
    } catch (error) {
      if (!active.current) return;
      const timeoutError = error instanceof DOMException && error.name === 'AbortError';
      setStatus({ kind: 'error', message: timeoutError ? 'The connection timed out and receipt could not be confirmed. Your details are still here. Please check before resubmitting.' : error instanceof Error ? error.message : 'Receipt could not be confirmed. Please try again.' });
    } finally { window.clearTimeout(timeout); }
  };
  return <form ref={form} className={`enquiry-form ${compact ? 'compact-form' : ''}`} onSubmit={submit}>
    <div className="form-heading"><span className="form-kicker">LET’S TALK ENGINEERING</span><h2>Tell us what you need.</h2><p>A few details now. A clearer project scope next.</p></div>
    {!site.enquiryEndpoint && <div className="form-notice"><AlertCircle size={19} /><p><strong>Online enquiries are being set up.</strong> You can prepare and download your enquiry below. Nothing will be sent from this form yet.</p></div>}
    <fieldset disabled={status.kind === 'sending' || status.kind === 'success'}>
      <div className="form-trap" aria-hidden="true"><label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" maxLength={200} /></label></div>
      <div className="form-grid">
        <label>Full name <span>*</span><input name="fullName" autoComplete="name" required minLength={2} maxLength={120} placeholder="Your full name" /></label>
        <label>Company name<input name="company" autoComplete="organization" maxLength={160} placeholder="Your organisation" /></label>
        <label>Email address <span>*</span><input name="email" type="email" autoComplete="email" required maxLength={180} placeholder="you@company.com" /></label>
        <label>Mobile number <span>*</span><input name="phone" type="tel" autoComplete="tel" required pattern={String.raw`(?=(?:[^0-9]*[0-9]){7,15}[^0-9]*$)[+0-9\(\) .\-]{7,22}`} title="Enter a phone number using 7–22 digits, spaces or + ( ) - characters." maxLength={22} placeholder="+91 —" /></label>
        <label className="full-width">Product / service required <span>*</span><div className="select-wrap"><select name="requirement" value={requirement} onChange={e => setRequirement(e.target.value)} required><option value="">Select a product or service</option>{initialRequirement && !options.includes(initialRequirement) && <option value={initialRequirement}>{initialRequirement}</option>}<optgroup label="Products">{products.map(p => <option key={p.id}>{p.title}</option>)}</optgroup><optgroup label="Engineering services">{serviceOptions.map(title => <option key={title}>{title}</option>)}</optgroup><option value="Other / multiple requirements">Other / multiple requirements</option></select></div></label>
        <label>Project location<input name="location" autoComplete="address-level2" maxLength={180} placeholder="City, state or project site" /></label>
        <label>Quantity / requirements<input name="quantity" maxLength={240} placeholder="Quantity or brief scope" /></label>
        <label className="full-width">Tell us about your project <span>*</span><textarea name="message" required minLength={10} maxLength={6000} rows={5} placeholder="Describe your application, specifications, scope and expected schedule…" /></label>
      </div>
      <div className="upload-area"><Paperclip size={22} /><div><label htmlFor={compact ? 'drawing-compact' : 'drawing-upload'}>Attach a drawing or specification</label><p>PDF, JPG, PNG, DWG or DXF · Up to 10 MB</p></div><input id={compact ? 'drawing-compact' : 'drawing-upload'} ref={fileInput} type="file" name="attachment" accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf" onChange={selectFile} aria-describedby="file-feedback" /></div>
      <div id="file-feedback">{file && <div className="selected-file"><FileText size={17} /><span>{file.name} · {(file.size / 1024).toFixed(0)} KB</span><button type="button" aria-label="Remove attachment" onClick={() => { setFile(null); if (fileInput.current) fileInput.current.value = ''; }}><X size={17} /></button></div>}{fileError && <div className="field-error" role="alert"><p>{fileError}</p><button className="text-link" type="button" onClick={() => setFileError('')}>Continue without an attachment</button></div>}</div>
      <label className="consent"><input type="checkbox" name="consent" value="agreed" required /><span>I agree to be contacted about this enquiry and have read the <Link to="/privacy">privacy policy</Link>. <b>*</b></span></label>
      <div className="form-actions"><button type="submit" className="button button-primary">{status.kind === 'sending' ? <LoaderCircle className="spin" size={18} /> : site.enquiryEndpoint ? <Send size={18} /> : <Download size={18} />}{status.kind === 'sending' ? 'Submitting…' : site.enquiryEndpoint ? 'Submit enquiry' : 'Download enquiry draft'}</button>{site.enquiryEndpoint && <button type="button" onClick={download} className="button button-outline"><Download size={17} />Save a copy</button>}</div>
    </fieldset>
    {status.kind !== 'idle' && <div ref={messageBox} tabIndex={-1} role={status.kind === 'error' ? 'alert' : 'status'} className={`form-result ${status.kind}`}>{status.kind === 'success' ? <CheckCircle2 size={23} /> : status.kind === 'sending' ? <LoaderCircle className="spin" size={22} /> : <AlertCircle size={22} />}<p>{status.message}</p></div>}
    <p className="form-privacy"><LockKeyhole size={14} />Your project information is used to respond to this enquiry.</p>
  </form>;
}
