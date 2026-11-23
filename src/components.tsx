import { useEffect, useRef, useState, useId } from 'react';
import type { ReactNode, KeyboardEvent } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUp, ChevronDown, ChevronLeft, ChevronRight, X, Menu, MessageSquare, Plus, Minus, Maximize2, ZoomIn, ZoomOut, Zap, ShieldCheck, Factory, Lightbulb, HardHat, Compass, Handshake, RefreshCw, Check, Crosshair, MapPin, Mail, Phone, Linkedin } from 'lucide-react';
import { company, products, processSteps, values, faqs } from './data';
import type { Product } from './data';
import { site, mediaFor, enquiryHref, safeHttpUrl } from './site';
import dimensions from './image-dimensions.json';

export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.08 }} transition={{ duration: .55, delay, ease: [.22, 1, .36, 1] }}>{children}</motion.div>;
}
export function Photo({ src, alt, className = '', eager = false }: { src: string; alt: string; className?: string; eager?: boolean }) {
  const source = mediaFor(src), size = (dimensions as Record<string, number[]>)[source];
  return <img className={className} src={source} width={size?.[0]} height={size?.[1]} alt={alt} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" />;
}
export function ButtonLink({ to, children, variant = 'primary', className = '' }: { to: string; children: ReactNode; variant?: 'primary' | 'outline' | 'dark' | 'light'; className?: string; arrow?: boolean }) {
  return <Link to={to} className={`button button-${variant} ${className}`}>{children}</Link>;
}
export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`eyebrow ${light ? 'on-dark' : ''}`}><span />{children}</p>;
}
export function SectionHeading({ label, title, description, dark = false }: { label: string; title: ReactNode; description?: string; dark?: boolean }) {
  return <div className={`section-heading ${dark ? 'on-dark' : ''}`}><Eyebrow light={dark}>{label}</Eyebrow><h2>{title}</h2>{description && <p>{description}</p>}</div>;
}
export function Logo({ footer = false }: { footer?: boolean }) {
  return <Link to="/" className={`brand ${footer ? 'brand-footer' : ''}`} aria-label="RAN ENGINEERS home"><span className="brand-symbol"><img src="/images/ran-logo.webp" alt="" width="100" height="60" /></span><span className="brand-name"><span className="brand-word">RAN</span><span className="brand-word">ENGINEERS</span></span></Link>;
}
const nav = [['/', 'Home'], ['/about', 'About us'], ['/products', 'Products'], ['/services', 'Services'], ['/projects', 'Projects'], ['/industries', 'Industries'], ['/contact', 'Contact']];
export function Header() {
  const [mobile, setMobile] = useState(false), [dropdown, setDropdown] = useState(false), [scrolled, setScrolled] = useState(false), [progress, setProgress] = useState(0);
  const location = useLocation();
  useEffect(() => { setMobile(false); setDropdown(false); }, [location]);
  useEffect(() => {
    const update = () => { setScrolled(window.scrollY > 35); const d = document.documentElement.scrollHeight - window.innerHeight; setProgress(d > 0 ? window.scrollY / d : 0); };
    window.addEventListener('scroll', update, { passive: true }); update();
    return () => window.removeEventListener('scroll', update);
  }, [location]);
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <div className="utility-bar"><div className="container"><span>ENGINEERING POWER. DELIVERING RELIABILITY.</span><span className="utility-right"><Zap size={13} />Electrical <i />Mechanical <i />Dam infrastructure</span></div></div>
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`} onKeyDown={e => { if (e.key === 'Escape') { setDropdown(false); setMobile(false); } }}>
      <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} />
      <div className="container header-inner"><Logo />
        <nav className="desktop-nav" aria-label="Main navigation">{nav.map(([path, label]) => path === '/products' ? <div key={path} className="nav-dropdown" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDropdown(false); }}><button className={`nav-trigger ${location.pathname.startsWith(path) ? 'active' : ''}`} aria-expanded={dropdown} aria-controls="product-menu" onClick={() => setDropdown(!dropdown)}>{label}<ChevronDown size={13} /></button>{dropdown && <div className="dropdown-panel" id="product-menu"><Link className="dropdown-all" to="/products">Explore all products </Link>{products.map(p => <Link key={p.id} to={`/products/${p.id}`}><span>{p.title}</span><small>{p.category}</small></Link>)}</div>}</div> : <NavLink key={path} to={path} end={path === '/'}>{label}</NavLink>)}</nav>
        <ButtonLink to={enquiryHref()} className="header-quote">Discuss Your Project</ButtonLink>
        <button className="mobile-toggle" onClick={() => setMobile(!mobile)} aria-label={mobile ? 'Close navigation' : 'Open navigation'} aria-expanded={mobile} aria-controls="mobile-nav">{mobile ? <X /> : <Menu />}</button>
      </div>
      {mobile && <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation">{nav.map(([path, label]) => <NavLink key={path} to={path} end={path === '/'}>{label}</NavLink>)}<ButtonLink to={enquiryHref()}>Discuss Your Project</ButtonLink></nav>}
    </header>
  </>;
}
export function Footer() {
  const contact = site.contact;
  return <footer className="site-footer"><div className="container">
    <div className="footer-cta"><div><Eyebrow light>LET’S BUILD WHAT’S NEXT</Eyebrow><h2>Let’s power your<br /><em>next project.</em></h2></div><div><p>Have a specification, a drawing, or a new idea?<br />Let’s start with your requirement.</p><ButtonLink to={enquiryHref()} arrow>Discuss Your Project</ButtonLink></div></div>
    <div className="footer-grid"><div className="footer-brand"><Logo footer /><p>Electrical and mechanical engineering for dams, ports and industrial infrastructure. Supporting dam projects for the Government of Gujarat.</p><div className="footer-social">{safeHttpUrl(contact.linkedin) ? <a href={contact.linkedin} target="_blank" rel="noreferrer"><Linkedin size={18} />LinkedIn</a> : <span>Engineering power. Delivering reliability.</span>}</div></div><div><h3>Explore</h3>{nav.filter(([p]) => p !== '/').map(([p, l]) => <Link key={p} to={p}>{l}</Link>)}</div><div><h3>Our products</h3>{products.map(p => <Link key={p.id} to={`/products/${p.id}`}>{p.title}</Link>)}</div><div><h3>Let’s connect</h3>{contact.address ? <p className="footer-contact"><MapPin size={17} />{contact.address}</p> : <p>Prepare your project brief using our enquiry form.</p>}{contact.phones.map(phone => <a key={phone} href={`tel:${phone.replace(/[^+\d]/g, '')}`}><Phone size={16} />{phone}</a>)}{contact.emails.map(email => <a key={email} href={`mailto:${email}`}><Mail size={16} />{email}</a>)}<Link className="footer-enquiry" to={enquiryHref()}>Contact RAN ENGINEERS</Link><Link to="/services">Electrical & mechanical services</Link></div></div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} RAN ENGINEERS. All rights reserved.</span><div><Link to="/privacy">Privacy policy</Link><span>Built with precision.</span></div></div>
  </div></footer>;
}
export function FloatingActions() {
  const [visible, setVisible] = useState(false); const reduced = useReducedMotion(); const { pathname } = useLocation();
  const [simulatorInView, setSimulatorInView] = useState(false);
  useEffect(() => { const cb = () => setVisible(window.scrollY > 700); window.addEventListener('scroll', cb, { passive: true }); return () => window.removeEventListener('scroll', cb); }, []);
  useEffect(() => {
    setSimulatorInView(false);
    const simulator = document.getElementById('explore-panel');
    if (!simulator || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => setSimulatorInView(entries[0].isIntersecting));
    observer.observe(simulator);
    return () => observer.disconnect();
  }, [pathname]);
  return <div className={`floating-actions ${simulatorInView ? 'simulator-visible' : ''}`}>{visible && <button className="back-top" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })}><ArrowUp size={19} /></button>}{pathname.replace(/\/$/, '') !== '/contact' && <Link to={enquiryHref()} className="floating-enquiry"><MessageSquare size={19} /><span>Quick enquiry</span></Link>}</div>;
}
export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  return <article className={`product-card ${compact ? 'compact' : ''}`}><Link to={`/products/${product.id}`} className="product-image"><Photo src={product.image} alt={`Representative ${product.title.toLowerCase()} application`} /><span className="image-open"></span></Link><div className="product-card-copy"><span className="category-label">{product.category}</span><h3><Link to={`/products/${product.id}`}>{product.title}</Link></h3><p>{product.shortDescription}</p><div className="product-links"><Link to={`/products/${product.id}`}>View details </Link><Link to={enquiryHref(product.title)}>Enquire</Link></div></div></article>;
}
export function Gallery({ images, title, imageAlts, actual = false }: { images: string[]; title: string; imageAlts?: string[]; actual?: boolean }) {
  const [selected, setSelected] = useState(0), [zoom, setZoom] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null), openButton = useRef<HTMLButtonElement>(null);
  const safeSelected = Math.max(0, Math.min(selected, images.length - 1));
  const alt = imageAlts?.[safeSelected] || `${title} — representative image ${safeSelected + 1}`;
  const close = () => { dialog.current?.close(); setZoom(false); openButton.current?.focus(); };
  const change = (direction: number) => { setSelected((safeSelected + direction + images.length) % images.length); setZoom(false); };
  useEffect(() => { setSelected(0); setZoom(false); }, [title]);
  return <div className={`gallery ${actual ? 'actual-project-gallery' : ''}`}>
    <button ref={openButton} className="gallery-main" onClick={() => dialog.current?.showModal()} aria-label={`Enlarge photograph: ${title}`}><Photo src={images[safeSelected]} alt={alt} eager /><span className="gallery-expand"><Maximize2 size={19} />View full photograph</span></button>
    {images.length > 1 && <div className="gallery-thumbs">{images.map((src, i) => <button className={selected === i ? 'selected' : ''} key={`${src}-${i}`} onClick={() => setSelected(i)} aria-label={`Show image ${i + 1}`} aria-pressed={selected === i}><Photo src={src} alt="" /></button>)}</div>}
    <dialog ref={dialog} className="lightbox" onClose={() => { setZoom(false); openButton.current?.focus(); }} onClick={e => { if (e.target === e.currentTarget) close(); }} onKeyDown={e => { if (e.key === 'ArrowRight') change(1); if (e.key === 'ArrowLeft') change(-1); }} aria-label={`${title} fullscreen gallery`}>
      <div className="lightbox-top"><span>{title}</span><div><button aria-label={zoom ? 'Zoom out' : 'Zoom in'} onClick={() => setZoom(!zoom)}>{zoom ? <ZoomOut /> : <ZoomIn />}</button><button onClick={close} aria-label="Close image gallery"><X /></button></div></div>
      <div className={`lightbox-image ${zoom ? 'zoomed' : ''}`}><Photo src={images[safeSelected]} alt={alt} /></div>
      <div className="lightbox-controls">{images.length > 1 && <button onClick={() => change(-1)} aria-label="Previous image"><ChevronLeft />Previous</button>}<span>{safeSelected + 1} / {images.length}</span>{images.length > 1 && <button onClick={() => change(1)} aria-label="Next image">Next<ChevronRight /></button>}</div>
    </dialog>
  </div>;
}
export function VisionMission() {
  return <section className="vision-section technical-grid"><div className="container vision-layout"><div className="vision-intro"><Eyebrow light>OUR DIRECTION</Eyebrow><h2>Purpose that<br />powers<br /><em>progress.</em></h2><span className="vision-symbol"><Zap size={58} strokeWidth={1} /></span></div><div className="vision-statements"><Reveal><div className="purpose-block"><span className="purpose-icon"><Crosshair size={27} /></span><div><h3>Our vision</h3><p>{company.vision}</p></div></div></Reveal><Reveal delay={.1}><div className="purpose-block"><span className="purpose-icon"><Compass size={27} /></span><div><h3>Our mission</h3><p>{company.mission}</p></div></div></Reveal></div></div></section>;
}

function tabKeys(event: KeyboardEvent<HTMLButtonElement>, active: number, ids: string[], change: (index: number) => void, prefix: string) {
  let next = active;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (active + 1) % ids.length;
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (active + ids.length - 1) % ids.length;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = ids.length - 1;
  else return;
  event.preventDefault(); change(next); document.getElementById(`${prefix}${ids[next]}`)?.focus();
}

const valueIcons = [Compass, ShieldCheck, HardHat, Handshake, RefreshCw];
export function Values() {
  const [active, setActive] = useState(0);
  return <div className="values-explorer"><div className="values-nav" role="tablist" aria-label="Core values">{values.map((v, i) => { const Icon = valueIcons[i]; return <button key={v.id} role="tab" id={`value-${v.id}`} tabIndex={active === i ? 0 : -1} onKeyDown={e => tabKeys(e, active, values.map(v => v.id), setActive, 'value-')} aria-selected={active === i} aria-controls="value-panel" onClick={() => setActive(i)} className={active === i ? 'active' : ''}><Icon size={25} /><span>{v.title}</span></button>; })}</div><div className="values-description" id="value-panel" role="tabpanel" aria-labelledby={`value-${values[active].id}`}><h3>{values[active].title}</h3><p>{values[active].description}</p></div></div>;
}
const processIcons = [MessageSquare, Compass, Factory, HardHat, ShieldCheck, Handshake];
export function ProcessTimeline() {
  const [active, setActive] = useState(0); const step = processSteps[active];
  return <div className="process-explorer"><div className="process-tabs" role="tablist" aria-label="Project delivery stages">{processSteps.map((s, i) => { const Icon = processIcons[i]; return <button key={s.id} id={`stage-${s.id}`} role="tab" tabIndex={active === i ? 0 : -1} onKeyDown={e => tabKeys(e, active, processSteps.map(s => s.id), setActive, 'stage-')} aria-selected={active === i} aria-controls="stage-panel" onClick={() => setActive(i)} className={active === i ? 'active' : ''}><Icon size={22} /><span>{s.title}</span><span className="stage-progress" /></button>; })}</div><div className="process-body" role="tabpanel" id="stage-panel" aria-labelledby={`stage-${step.id}`}><div className="process-copy"><span className="category-label">{step.title.toUpperCase()}</span><h3>{step.headline}</h3><p>{step.description}</p><ul className="check-list">{step.deliverables.map(d => <li key={d}><Check size={16} />{d}</li>)}</ul><Link className="text-link" to={enquiryHref()}>Discuss your requirement </Link></div><div className="process-visual"><Photo src={active === 0 || active === 4 ? '/images/technician.webp' : step.image} alt={`${step.title} — representative electrical engineering photograph`} /><div className="process-visual-caption"><Zap size={18} /><span>One scope. Every connection.</span></div></div></div></div>;
}
export function FAQSection({ limit }: { limit?: number }) {
  return <section className="section faq-section"><div className="container faq-layout"><SectionHeading label="A LITTLE MORE CLARITY" title={<>Good questions.<br />Clear answers.</>} description="A few useful details before we get started." /><div className="faq-list">{faqs.slice(0, limit || faqs.length).map(f => <details key={f.question}><summary>{f.question}<Plus className="faq-plus" size={18} /><Minus className="faq-minus" size={18} /></summary><p>{f.answer}</p></details>)}</div></div></section>;
}
export function BeforeAfter() {
  const [position, setPosition] = useState(50); const id = useId();
  return <div className="comparison"><div className="comparison-images"><img src="/images/comparison-before.svg" alt="Illustrative unconnected electrical cabinet layout before installation" /><div className="comparison-after" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}><img src="/images/comparison-after.svg" alt="Illustrative organised electrical cabinet layout after installation" /></div><span className="comparison-label left">Planned installation</span><span className="comparison-label right">Initial layout</span><span className="comparison-line" style={{ left: `${position}%` }}><span><ChevronLeft size={18} /><ChevronRight size={18} /></span></span><input id={id} type="range" min="0" max="100" value={position} onChange={e => setPosition(Number(e.target.value))} aria-label="Compare illustrative initial and planned electrical installation" /></div><label htmlFor={id}>Drag to explore · Illustrative layout only, not a completed RAN project.</label></div>;
}
export function CircuitArt() {
  return <svg className="circuit-art" viewBox="0 0 620 200" role="img" aria-label="Conceptual connection from power supply through electrical panel to industrial equipment, with an earthing connection"><defs><pattern id="circuit-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="currentColor" opacity=".13" /></pattern></defs><rect width="620" height="200" fill="url(#circuit-grid)" /><g fill="none" stroke="currentColor" strokeWidth="1.5"><path className="animated-wire" d="M80 100H230M390 100H540M310 140V175" /><rect x="20" y="62" width="95" height="76" rx="3" /><rect x="230" y="40" width="160" height="100" rx="3" /><rect x="505" y="62" width="95" height="76" rx="3" /><path d="M287 175H333M295 183H325M303 191H317M55 92l12-18-2 18h15l-16 22 3-22zM255 65h25v20h-25zm0 35h25v20h-25zm45-35h25v20h-25zm0 35h25v20h-25zm45-35h25v20h-25zm0 35h25v20h-25zM525 113V85l14 8V82l15 9V78l24 9v26z" /></g><g fill="currentColor" fontFamily="inherit" fontSize="13" textAnchor="middle"><text x="67" y="160">Supply</text><text x="310" y="25">Panel</text><text x="552" y="160">Equipment</text></g></svg>;
}
export function PageHero({ eyebrow, title, description, image, imageAlt = 'Representative electrical infrastructure', imageCaption, children }: { eyebrow: string; title: ReactNode; description: string; image?: string; imageAlt?: string; imageCaption?: string; children?: ReactNode }) {
  return <section className={`page-hero ${image ? 'with-image' : ''}`}>{image && <div className="page-hero-image"><Photo src={image} alt={imageAlt} eager /></div>}<div className="container"><div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><span>{eyebrow}</span></div><Eyebrow light>{eyebrow}</Eyebrow><h1>{title}</h1><p className="page-hero-description">{description}</p>{children}{image && imageCaption && <span className="page-photo-note">{imageCaption}</span>}</div></section>;
}
