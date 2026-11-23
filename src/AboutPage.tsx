import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, Compass, ShieldCheck, HardHat, Handshake, RefreshCw, Focus, MoveUpRight, MapPin } from 'lucide-react';
import { company, projects, values } from './data';
import { ButtonLink, Eyebrow } from './components';
import { CompanyJourney } from './CompanyJourney';
import { AboutCapabilities } from './AboutCapabilities';
import './about-page.css';

const story = [
  'RAN ENGINEERS began its journey in 2005 with a modest setup in a small apartment room and a clear ambition — to deliver reliable electrical engineering services with uncompromising commitment to quality.',
  'Starting as a small government electrical contractor, the company initially undertook street lighting and minor electrical installation projects. Through consistent workmanship, technical development and a commitment to completing projects successfully, RAN ENGINEERS gradually earned the confidence of government departments and public authorities.',
  'Over the years, the company expanded its operations from municipal electrical works into major irrigation infrastructure projects, particularly electrical and mechanical installations at dams across Gujarat.',
  'Our experience now extends across dam infrastructure, high-mast lighting, power distribution systems, gantry crane installations and overhauling, electrical control panels and industrial engineering services.',
  'Today, RAN ENGINEERS continues to build upon its experience by expanding into manufacturing, strengthening its engineering capabilities and serving a wider range of infrastructure and industrial sectors.',
];

const valueIcons = [Compass, ShieldCheck, HardHat, Handshake, RefreshCw];

/** Decorative movement never controls content visibility or navigation. */
function useAboutMotion() {
  const page = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = page.current;
    if (!root) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      if (preference.matches) {
        root.style.setProperty('--about-parallax', '0px');
        root.style.setProperty('--about-collage-shift', '0px');
        return;
      }
      const hero = root.querySelector<HTMLElement>('.about-hero');
      const collage = root.querySelector<HTMLElement>('.about-story-collage');
      if (hero) {
        const rect = hero.getBoundingClientRect();
        if (rect.bottom > 0) root.style.setProperty('--about-parallax', `${Math.min(65, Math.max(0, -rect.top) * .12)}px`);
      }
      if (collage) {
        const rect = collage.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const shift = Math.max(-15, Math.min(15, (rect.top - window.innerHeight * .3) * .035));
          root.style.setProperty('--about-collage-shift', `${shift.toFixed(1)}px`);
        }
      }
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!preference.matches) entry.target.classList.add('about-arrived');
          observer?.unobserve(entry.target);
        }
      });
    }, { threshold: .12 }) : null;
    root.querySelectorAll('[data-about-reveal]').forEach(el => observer?.observe(el));
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    preference.addEventListener('change', schedule);
    update();
    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      preference.removeEventListener('change', schedule);
    };
  }, []);
  return page;
}

function StoryCollage() {
  return <div className="about-story-collage" data-about-reveal>
    <div className="about-collage-index" aria-hidden="true"><span>ENGINEERING IN PRACTICE</span><i /><span>INSTALLATION &amp; INSPECTION</span></div>
    <figure className="about-collage-installation"><Link to="/services" aria-label="Explore our infrastructure installation services"><img src="/images/about/overhead-services-installation.webp" alt="Workers in hard hats install overhead metal services in a concrete building, with one worker on an orange stepladder." width="1024" height="768" loading="lazy" decoding="async" /></Link><figcaption>Infrastructure installation work</figcaption></figure>
    <figure className="about-collage-inspection"><Link to="/services" aria-label="Explore our electrical engineering services"><img src="/images/about/electrical-panel-inspection.jpg" alt="A technician wearing a hard hat and high-visibility vest inspects wiring inside an open electrical cabinet while holding a tablet." width="509" height="339" loading="lazy" decoding="async" /></Link><figcaption>Electrical inspection &amp; maintenance</figcaption></figure>
    <div className="about-collage-note"><span className="about-crosshair" aria-hidden="true"><Focus size={32} strokeWidth={1} /></span><p>Practical engineering.<span>Installation, inspection and site coordination.</span></p></div>
  </div>;
}

function Purpose() {
  return <section className="about-purpose about-section" id="our-purpose" aria-labelledby="purpose-heading">
    <div className="container">
      <div className="about-purpose-heading" data-about-reveal><div><Eyebrow>OUR VISION, MISSION & VALUES</Eyebrow><h2 id="purpose-heading">A clear purpose.<br /><span>Enduring principles.</span></h2></div><p>Our next chapter starts with the same commitments that have guided us from the beginning.</p></div>
      <div className="about-purpose-grid">
        <article className="about-purpose-card" data-about-reveal><span className="about-purpose-number">01 / OUR DIRECTION</span><Compass size={34} strokeWidth={1.25} aria-hidden="true" /><h3>Our Vision</h3><p>{company.vision}</p><div className="about-purpose-line" aria-hidden="true"><i /><span /><i /></div></article>
        <article className="about-purpose-card mission" data-about-reveal><span className="about-purpose-number">02 / OUR COMMITMENT</span><Focus size={34} strokeWidth={1.25} aria-hidden="true" /><h3>Our Mission</h3><p>{company.mission}</p><div className="about-purpose-line" aria-hidden="true"><i /><span /><i /></div></article>
      </div>
      <div className="about-values-heading"><h3>Our Core Values</h3><span>THE PRINCIPLES BEHIND OUR WORK</span></div>
      <div className="about-value-grid">{values.map((value, index) => { const Icon = valueIcons[index]; return <article className="about-value-card" data-about-reveal key={value.id}><Icon size={28} strokeWidth={1.4} aria-hidden="true" /><h4>{value.title}</h4><p>{value.description}</p><span className="about-value-index" aria-hidden="true">0{index + 1}</span></article>; })}</div>
    </div>
  </section>;
}

export function AboutPage() {
  const page = useAboutMotion();
  return <div className="about-page" ref={page}>
    <section className="about-hero" aria-labelledby="about-heading">
      <div className="about-hero-image"><img src={projects[1].image} alt={projects[1].imageAlt} width="1280" height="960" loading="eager" fetchPriority="high" decoding="async" /></div>
      <div className="container about-hero-inner">
        <nav className="about-breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">About us</span></nav>
        <div className="about-hero-copy"><Eyebrow light>BUILT ON DETERMINATION. DRIVEN BY ENGINEERING.</Eyebrow><h1 id="about-heading">From Humble Beginnings to <em>Engineering Excellence.</em></h1><p>Since 2005, RAN ENGINEERS has grown from a small electrical contracting firm into an established engineering company, delivering electrical, mechanical and infrastructure solutions for government departments, irrigation projects, dams and industries across Gujarat.</p><a className="about-journey-link" href="#company-journey">Discover our journey<ArrowDown size={18} aria-hidden="true" /></a></div>
        <div className="about-hero-bottom"><a href="#our-story" className="about-scroll-cue"><span aria-hidden="true"><i /></span>SCROLL TO EXPLORE</a><Link className="about-photo-credit" to={`/projects/${projects[1].id}`}><MapPin size={16} aria-hidden="true" /><span>Sani Dam, Gujarat<small>National flag lighting</small></span><MoveUpRight size={16} aria-hidden="true" /></Link></div>
      </div>
    </section>
    <div className="about-facts" aria-label="Company at a glance"><div className="container"><div><span>OUR BEGINNING</span><strong>EST. 2005</strong></div><div><span>OUR EXPERIENCE</span><strong>20+ YEARS OF EXPERIENCE</strong></div><div><span>OUR HOME</span><strong>GUJARAT, INDIA</strong></div></div></div>
    <section className="about-story-section about-section" id="our-story" aria-labelledby="story-heading"><div className="container"><div className="about-story-heading" data-about-reveal><Eyebrow>OUR STORY</Eyebrow><h2 id="story-heading">Founded on Determination.<br />{' '}Built Through Experience.<br />{' '}<span>Growing Through Engineering.</span></h2></div><div className="about-story-grid"><div className="about-story-copy" data-about-reveal>{story.map((paragraph, i) => <p key={i} className={i === 0 ? 'about-story-lead' : undefined}>{paragraph}</p>)}<p className="about-story-conclusion">What started in one small room has evolved into an organisation committed to powering infrastructure through engineering excellence.</p></div><StoryCollage /></div></div></section>
    <CompanyJourney />
    <AboutCapabilities />
    <Purpose />
    <section className="about-closing" aria-labelledby="about-closing-heading"><div className="about-closing-image"><img src={projects[3].image} alt={projects[3].imageAlt} width="960" height="1280" loading="lazy" decoding="async" /></div><div className="container about-closing-inner" data-about-reveal><Eyebrow light>ENGINEERING THE FUTURE</Eyebrow><h2 id="about-closing-heading">Our Journey Started in One Room.<br /><em>Our Ambition Reaches Across Industries.</em></h2><p>From our first street lighting contract to complex dam infrastructure, gantry crane engineering and electrical panel manufacturing, RAN ENGINEERS continues to move forward with the same determination that started our journey in 2005.</p><div className="about-closing-actions"><ButtonLink to="/projects">Explore Our Projects</ButtonLink><ButtonLink to="/contact" variant="light">Contact RAN ENGINEERS</ButtonLink></div><span className="about-closing-caption">KARJAN DAM, GUJARAT</span></div></section>
  </div>;
}
