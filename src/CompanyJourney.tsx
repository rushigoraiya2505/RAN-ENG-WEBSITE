import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from 'motion/react';
import { projects } from './data';
import './company-journey.css';

export const journeyMilestones = [
  { year: '2005', phase: 'THE FOUNDATION', title: 'Where It All Began', description: 'RAN ENGINEERS was established as a small electrical contracting firm, operating from a modest apartment room with the vision of building a trusted engineering business.' },
  { year: '2006', phase: 'THE FIRST CONTRACT', title: 'Our First Government Contract', description: 'Secured the company’s first electrical installation contract for street lighting works in Baroda (Vadodara), Gujarat, marking the beginning of its government contracting journey.' },
  { year: '2008', phase: 'PUBLIC INFRASTRUCTURE', title: 'Expanding Into Public Infrastructure', description: 'Expanded operations to undertake electrical works for CWC (Central Water Commission) and municipal corporations, increasing the company’s participation in public infrastructure projects.' },
  { year: '2013', phase: 'DAM & IRRIGATION WORKS', title: 'Entering Gujarat’s Irrigation Sector', description: 'Entered the irrigation department’s infrastructure projects, undertaking high-mast lighting and electrical installation works at dams, laying the foundation for the company’s growing specialisation in dam engineering.' },
  { year: '2015', phase: 'INSTITUTIONAL ENGINEERING', title: 'Engineering Work for ISRO, Ahmedabad', description: 'Undertook lighting and electrical installation works for ISRO in Ahmedabad, representing an important milestone in the company’s experience with specialised institutional infrastructure.' },
  { year: '2019', phase: 'A DELIVERY MILESTONE', title: '400 Projects Successfully Commissioned', description: 'Reached the milestone of successfully executing and commissioning 400 projects, reflecting years of technical experience, customer confidence and consistent project delivery.' },
  { year: '2023', phase: 'ACROSS GUJARAT', title: 'Contributing to 200+ Dams Across Gujarat', description: 'Achieved the milestone of successfully completing engineering projects across more than 200 dams in Gujarat, strengthening RAN ENGINEERS’ presence in the state’s irrigation infrastructure sector.' },
  { year: '2024', phase: 'INTEGRATED ENGINEERING', title: 'Entering Manufacturing & Gantry Crane Overhauling', description: 'Expanded into electrical panel manufacturing and gantry crane overhauling, diversifying from traditional electrical contracting into integrated electrical and mechanical engineering solutions.' },
  { year: '2026', phase: 'THE NEXT CHAPTER', title: 'Expanding Our Manufacturing Capabilities', description: 'Advanced into dedicated manufacturing facilities for electrical panels and associated engineering systems, strengthening in-house capabilities to support government infrastructure and industrial customers.' },
] as const;

function OfficeDrawing() {
  return <svg className="journey-drawing" viewBox="0 0 540 360" role="img" aria-label="Concept illustration of a modest office room with a desk, chair and window">
    <g className="journey-drawing-grid" fill="none" stroke="currentColor" strokeWidth="1"><path d="M30 0v360M70 0v360M110 0v360M150 0v360M190 0v360M230 0v360M270 0v360M310 0v360M350 0v360M390 0v360M430 0v360M470 0v360M510 0v360M0 40h540M0 80h540M0 120h540M0 160h540M0 200h540M0 240h540M0 280h540M0 320h540" /></g>
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M61 289V62h414v227M42 289h454M72 299h393" />
      <rect x="87" y="89" width="133" height="100" /><path d="M153.5 89v100M87 139h133M79 198h150" />
      <path d="M287 113h118v76H287zM298 128h46M298 142h87M298 156h65" opacity=".55" />
      <path d="M111 224h213v12H111zM123 236v53m189-53v53M136 212h74v12h-74M220 201h35v23h-35M216 201h42" />
      <path d="M344 223v-29q0-12 12-12h30q12 0 12 12v38h-54M336 237h70v10h-70zM352 247v42m39-42v42M352 264h39" />
      <path d="M428 231h30v58h-30zM432 241h22m-22 13h22m-22 13h22" opacity=".55" />
      <path d="M61 45h414M61 40v10m414-10v10" className="journey-drawing-accent" />
      <path d="M46 62v227M41 62h10m-10 227h10" opacity=".35" />
    </g>
    <g fontFamily="inherit" fill="currentColor" fontSize="13" letterSpacing="2"><text x="61" y="327">A SMALL ROOM. A CLEAR AMBITION.</text><text x="61" y="28" className="journey-drawing-accent">THE BEGINNING</text></g>
  </svg>;
}

function LightingDrawing() {
  return <svg className="journey-drawing" viewBox="0 0 540 360" role="img" aria-label="Concept illustration of street-lighting poles along a roadway">
    <g fill="none" stroke="currentColor" strokeWidth="1" className="journey-drawing-grid"><path d="M0 60h540M0 120h540M0 180h540M0 240h540M0 300h540M60 0v360M120 0v360M180 0v360M240 0v360M300 0v360M360 0v360M420 0v360M480 0v360" /></g>
    <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"><path d="M30 285h480M30 297h480M30 318h80m26 0h80m26 0h80m26 0h80m26 0h56M106 285V67h8v218M114 67h86l19 12v10h-45M108 64q15-29 63-25h53" /><path d="M282 285V117h7v168M289 117h67l15 10v8h-36M283 114q14-23 50-21h42" /><path d="M428 285V162h6v123M434 162h46l13 8v8h-31M429 159q10-16 36-16h31" /></g>
    <g className="journey-light-cones" fill="#ff8a24"><path d="M178 92h34l43 122H134z" /><path d="M338 138h27l32 95h-91z" /><path d="M464 181h23l21 66h-65z" /></g>
    <g fill="none" stroke="#ff8a24" strokeWidth="3"><path d="M177 89h37M337 135h31M463 178h27" /></g>
    <g fill="currentColor" fontSize="13" letterSpacing="2" fontFamily="inherit"><text x="31" y="34">ELECTRICAL INSTALLATION</text><text x="31" y="345">BARODA / VADODARA · GUJARAT</text></g>
  </svg>;
}

function PublicInfrastructureDrawing() {
  return <div className="journey-institution-card journey-public-card"><span className="journey-visual-eyebrow">PUBLIC INFRASTRUCTURE</span><svg viewBox="0 0 480 128" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="2"><path d="M28 116h177M42 116V48h149v68M57 48V31h117v17M53 67h13v16H53zm33 0h13v16H86zm33 0h13v16h-13zm33 0h13v16h-13zM104 116V94h24v22M276 116h176M293 116V52l71-27 71 27v64M285 52h158M307 66v39m28-39v39m30-39v39m28-39v39m28-39v39" /><path d="M210 80h20V48h22v32h20" className="journey-drawing-accent" /></g></svg><div className="journey-institution-names"><div><strong>CWC</strong><span>Central Water Commission</span></div><div><strong>Municipal corporations</strong><span>Electrical works</span></div></div></div>;
}

function AnimatedMilestoneNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (reducedMotion || !ref.current) { setDisplay(value); return; }
    let animation = 0;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      const started = performance.now();
      const tick = (now: number) => {
        const elapsed = Math.min(1, (now - started) / 1250);
        setDisplay(Math.round(value * (1 - Math.pow(1 - elapsed, 3))));
        if (elapsed < 1) animation = requestAnimationFrame(tick);
      };
      animation = requestAnimationFrame(tick);
    }, { threshold: .6 });
    observer.observe(ref.current);
    return () => { observer.disconnect(); cancelAnimationFrame(animation); };
  }, [value, reducedMotion]);
  return <span ref={ref} className="journey-animated-number"><span aria-hidden="true">{display}{suffix}</span><span className="journey-sr-only">{value}{suffix}</span></span>;
}

function PortfolioPhoto({ id, className = '' }: { id: string; className?: string }) {
  const project = projects.find(item => item.id === id);
  if (!project) return null;
  return <Link to={`/projects/${project.id}`} className={`journey-portfolio-photo ${project.orientation} ${className}`} aria-label={`Explore related project: ${project.title}`}><img src={project.image} alt={project.imageAlt} width={project.orientation === 'portrait' ? 960 : 1280} height={project.orientation === 'portrait' ? 1280 : 960} loading="lazy" decoding="async" /><span>{project.location}</span></Link>;
}

function MilestoneVisual({ year }: { year: string }) {
  if (year === '2005') return <figure className="journey-visual journey-concept"><OfficeDrawing /><figcaption>Our modest beginnings</figcaption></figure>;
  if (year === '2006') return <figure className="journey-visual journey-concept"><LightingDrawing /><figcaption>Street-lighting infrastructure</figcaption></figure>;
  if (year === '2008') return <figure className="journey-visual"><PublicInfrastructureDrawing /><figcaption>Electrical works for public infrastructure</figcaption></figure>;
  if (year === '2013') return <figure className="journey-visual journey-tall-photo"><PortfolioPhoto id="machhu-ii-dam-high-mast-lighting" /><figcaption>High-mast lighting</figcaption></figure>;
  if (year === '2015') return <figure className="journey-visual"><div className="journey-institution-card journey-isro-card"><span className="journey-visual-eyebrow">LIGHTING & ELECTRICAL WORKS</span><div className="journey-isro-type"><strong>ISRO</strong><span>Ahmedabad</span></div><div className="journey-institution-rule" aria-hidden="true"><i /><span /><i /></div><p>Specialised institutional infrastructure</p></div><figcaption>Company milestone · Lighting and electrical installation</figcaption></figure>;
  if (year === '2019') return <figure className="journey-visual"><div className="journey-number-card"><span className="journey-visual-eyebrow">A MILESTONE REACHED IN 2019</span><AnimatedMilestoneNumber value={400} /><strong>Projects successfully commissioned</strong><svg viewBox="0 0 450 60" aria-hidden="true" fill="none"><path d="M0 30h85V12h70v36h70V12h70v36h70V30h85" stroke="currentColor" strokeWidth="1.5" /><g fill="#ff8a24"><circle cx="85" cy="30" r="4" /><circle cx="225" cy="30" r="4" /><circle cx="365" cy="30" r="4" /></g></svg></div><figcaption>Company milestone · Project delivery</figcaption></figure>;
  if (year === '2023') return <figure className="journey-visual journey-dam-montage"><div className="journey-montage-stat"><AnimatedMilestoneNumber value={200} suffix="+" /><span>Dams across Gujarat<br /><strong>Milestone reached in 2023</strong></span></div><div className="journey-montage-images"><PortfolioPhoto id="sani-dam-national-flag-lighting" /><PortfolioPhoto id="karjan-dam-gantry-crane-box" /><PortfolioPhoto id="machhu-ii-dam-high-mast-lighting" /></div><figcaption>Gujarat dam infrastructure</figcaption></figure>;
  if (year === '2024') return <figure className="journey-visual journey-tall-photo"><PortfolioPhoto id="pipavav-port-gantry-crane-box" /><figcaption>Crane electrical controls</figcaption></figure>;
  return <figure className="journey-visual journey-installation-photo"><img src="/images/about/switchboard-inspection.webp" alt="Two technicians inspect a row of electrical switchboards, with one reaching toward the controls while the other holds paperwork." width="500" height="375" loading="lazy" decoding="async" /><figcaption>Electrical panel inspection</figcaption></figure>;
}

/** Company history supplied by RAN ENGINEERS; related photographs are portfolio illustrations. */
export function CompanyJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const stagesRef = useRef<HTMLOListElement>(null);
  const [activeYear, setActiveYear] = useState<string>('2005');
  const [progress, setProgress] = useState(0);
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current, stages = stagesRef.current;
    if (!section || !stages) return;
    const rows = Array.from(stages.querySelectorAll<HTMLElement>('[data-journey-year]'));
    let frame = 0, nearViewport = false;
    const update = () => {
      frame = 0;
      const bounds = stages.getBoundingClientRect();
      const cursor = window.innerHeight * .5;
      const value = Math.max(0, Math.min(1, (cursor - bounds.top) / bounds.height));
      setProgress(Math.round(value * 100));
      let nearest = rows[0]?.dataset.journeyYear || '2005';
      for (const row of rows) {
        if (row.getBoundingClientRect().top < cursor) nearest = row.dataset.journeyYear || nearest;
      }
      setActiveYear(nearest);
    };
    const schedule = () => { if (nearViewport && !frame) frame = requestAnimationFrame(update); };
    const nearby = new IntersectionObserver(entries => {
      nearViewport = entries.some(entry => entry.isIntersecting);
      if (nearViewport) schedule();
    }, { rootMargin: '120px 0px' });
    nearby.observe(section);
    const reveals = new IntersectionObserver(entries => {
      const years = entries.filter(entry => entry.isIntersecting).map(entry => (entry.target as HTMLElement).dataset.journeyYear!);
      if (years.length) setRevealed(previous => new Set([...previous, ...years]));
      entries.filter(entry => entry.isIntersecting).forEach(entry => reveals.unobserve(entry.target));
    }, { threshold: .16 });
    rows.forEach(row => reveals.observe(row));
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
    return () => { nearby.disconnect(); reveals.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, []);

  return <section ref={sectionRef} className={`company-journey ${reducedMotion ? 'journey-reduced-motion' : ''}`} id="company-journey" aria-labelledby="company-journey-title">
    <div className="container journey-heading"><p className="eyebrow"><span />THE RAN ENGINEERS JOURNEY</p><h2 id="company-journey-title">Two Decades of Progress.<br /><em>One Vision of Excellence.</em></h2><p>Explore the milestones that shaped RAN ENGINEERS — from its first electrical installation project to dam infrastructure, government engineering contracts and manufacturing.</p></div>
    <div className="journey-navigation"><div className="container journey-navigation-inner"><div className="journey-current"><span>OUR JOURNEY</span><strong>{activeYear}</strong></div><nav aria-label="Company journey milestones">{journeyMilestones.map(milestone => <a key={milestone.year} href={`#journey-${milestone.year}`} aria-label={`${milestone.year}: ${milestone.title}`} aria-current={activeYear === milestone.year ? 'step' : undefined}>{milestone.year}</a>)}</nav><div className="journey-progress-meta"><span>2005 — 2026</span><progress aria-label="Progress through company journey" max={100} value={progress} /></div></div></div>
    <ol className="container journey-stages" ref={stagesRef} style={{ '--journey-progress': `${progress}%` } as CSSProperties}>
      {journeyMilestones.map((milestone, index) => <li id={`journey-${milestone.year}`} key={milestone.year} data-journey-year={milestone.year} className={`journey-stage ${index % 2 ? 'journey-stage-reverse' : ''} ${revealed.has(milestone.year) ? 'is-revealed' : ''} ${activeYear === milestone.year ? 'is-current' : ''}`}><span className="journey-junction" aria-hidden="true"><i /></span><article className="journey-stage-card"><div className="journey-stage-copy"><div className="journey-year-line"><time dateTime={milestone.year}>{milestone.year}</time><span>{milestone.phase}</span></div><h3>{milestone.title}</h3><p>{milestone.description}</p></div><MilestoneVisual year={milestone.year} /></article></li>)}
    </ol>
    <div className="container journey-end"><span aria-hidden="true" /><p>Founded on Determination.<br /><strong>Built Through Experience. Growing Through Engineering.</strong></p></div>
  </section>;
}
