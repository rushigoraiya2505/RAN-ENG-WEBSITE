import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Check, Factory, HardHat, Lightbulb, MapPin, Zap } from 'lucide-react';
import { ButtonLink, Eyebrow } from './components';
import { projects } from './data';
import type { Service } from './data';
import { enquiryHref } from './site';
import { serviceContent, serviceGroupContent } from './serviceContent';
import type { ServiceContent, ServiceImage } from './serviceContent';
import './services-page.css';

function useServiceReveals() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || !('IntersectionObserver' in window)) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (!preference.matches) entry.target.classList.add('service-arrived');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 });
    root.querySelectorAll('[data-service-reveal]').forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  return ref;
}

function ServicePhotograph({ image, compact = false }: { image: ServiceImage; compact?: boolean }) {
  const photograph = <img src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async" />;
  return <figure className={`services-photo ${compact ? 'services-photo-compact' : ''} services-photo-${image.kind}`}>
    {image.projectId
      ? <Link className="services-photo-stage" to={`/projects/${image.projectId}`} aria-label={`View project: ${image.caption}`}>{photograph}<span className="services-photo-link"><ArrowUpRight size={19} aria-hidden="true" />View project</span></Link>
      : <div className="services-photo-stage">{photograph}</div>}
    <figcaption><span>{image.caption}</span></figcaption>
  </figure>;
}

function ServiceScope({ scope }: { scope: string[] }) {
  return <ul className="services-scope-list">{scope.map(item => <li key={item}><Check size={17} strokeWidth={1.7} aria-hidden="true" /><span>{item}</span></li>)}</ul>;
}

function SupportingService({ service, image }: { service: Service; image?: ServiceImage }) {
  return <article className={`services-support ${image ? 'has-photo' : ''}`} id={service.id}>
    {image && <ServicePhotograph image={image} compact />}
    <div className="services-support-copy"><p className="services-small-label">CONNECTED INSTALLATION SERVICE</p><h4>{service.title}</h4><p>{service.description}</p><details className="services-scope-details"><summary>Explore the service scope<span aria-hidden="true">+</span></summary><ServiceScope scope={service.scope} /></details><p className="services-support-applications"><strong>Applications:</strong> {service.applications.join(' · ')}</p><Link className="services-inline-link" to={enquiryHref(service.title)}>Discuss {service.title.toLowerCase()}<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
  </article>;
}

function ServiceFeature({ service, index }: { service: ServiceContent; index: number }) {
  const relatedProjects = service.relatedProjectIds.map(id => projects.find(project => project.id === id)).filter(project => project !== undefined);
  return <article className={`services-feature ${index % 2 ? 'services-feature-reverse' : ''}`} id={service.id}>
    <div className="services-feature-layout" data-service-reveal>
      <ServicePhotograph image={service.image} />
      <div className="services-feature-copy"><div className="services-feature-index"><span>{String(index + 1).padStart(2, '0')}</span><i aria-hidden="true" /><span>RAN ENGINEERS</span></div><h3>{service.title}</h3><p>{service.description}</p>{service.additionalDescription && <p>{service.additionalDescription}</p>}<ServiceScope scope={service.scope} /><div className="services-applications" aria-label="Typical applications">{service.applications.map(application => <span key={application}>{application}</span>)}</div><div className="services-feature-actions"><ButtonLink to={enquiryHref(service.title)}>Discuss this service</ButtonLink>{service.productId && <Link to={`/products/${service.productId}`} className="services-inline-link">Related products<ArrowUpRight size={16} aria-hidden="true" /></Link>}</div></div>
    </div>
    {relatedProjects.length > 0 && <div className="services-project-connections"><span>RELATED PROJECT EXPERIENCE</span><div>{relatedProjects.map(project => <Link key={project.id} to={`/projects/${project.id}`}><MapPin size={16} aria-hidden="true" /><span>{project.title}</span><ArrowUpRight size={17} aria-hidden="true" /></Link>)}</div></div>}
    {service.supportingServices?.map(support => <SupportingService key={support.service.id} {...support} />)}
  </article>;
}

export function ServicesPage() {
  const page = useServiceReveals();
  const heroProject = projects.find(project => project.id === 'kadan-dam-gantry-crane-overhauling')!;
  const icons = [HardHat, HardHat, Zap, Lightbulb];
  return <div className="services-page" ref={page}>
    <section className="services-hero" aria-labelledby="services-page-title"><div className="container services-hero-layout"><div className="services-hero-copy"><nav className="services-breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Services</span></nav><Eyebrow light>RAN ENGINEERS · SANAND, GUJARAT</Eyebrow><h1 id="services-page-title">Electrical & Mechanical<br />{' '}<em>Engineering Services.</em></h1><p>From government electrical contracting to gantry crane overhauling and panel manufacturing, we bring practical engineering capability to dams, public infrastructure and industrial facilities across Gujarat.</p><div className="services-hero-actions"><ButtonLink to={enquiryHref()}>Discuss Your Project</ButtonLink><Link className="services-hero-projects" to="/projects">View Our Projects<ArrowUpRight size={17} aria-hidden="true" /></Link></div><a className="services-hero-scroll" href="#services-overview">EXPLORE OUR CAPABILITIES<ArrowDown size={17} aria-hidden="true" /></a></div><figure className="services-hero-photo"><Link to={`/projects/${heroProject.id}`} aria-label="View the Kadana Dam gantry crane overhauling project"><img src={heroProject.image} alt={heroProject.imageAlt} width="960" height="1280" loading="eager" fetchPriority="high" decoding="async" /></Link><figcaption><strong>Kadana Dam</strong><p>Mechanical & electrical gantry crane overhauling</p></figcaption></figure></div></section>

    <section className="services-overview-section" id="services-overview" aria-labelledby="services-overview-title"><div className="container"><div className="services-introduction" data-service-reveal><div><Eyebrow>A CLEAR SCOPE OF WORK</Eyebrow><h2 id="services-overview-title">Connected capabilities.<br /><span>One considered approach.</span></h2></div><p>From a control panel to a dam installation, every requirement begins with a clear scope. Explore our electrical, mechanical and site services, and the project experience behind them.</p></div><nav className="services-group-navigation" aria-label="Browse engineering service groups">{serviceGroupContent.map((group, index) => { const Icon = icons[index]; return <a href={`#${group.id}`} key={group.id}><span className="services-group-icon"><Icon size={25} strokeWidth={1.4} aria-hidden="true" /></span><span><strong>{group.title}</strong><small>{serviceContent.filter(service => service.groupId === group.id).length} core services</small></span><ArrowDown size={18} aria-hidden="true" /></a>; })}</nav><div className="services-sitc"><strong>SITC</strong><p><span>Supply, Installation, Testing and Commissioning.</span> The precise scope and responsibilities are agreed for each project.</p></div></div></section>

    {serviceGroupContent.map((group, groupIndex) => <section className={`services-area services-area-${groupIndex + 1}`} id={group.id} key={group.id} aria-labelledby={`${group.id}-heading`}><div className="container"><div className="services-area-heading" data-service-reveal><div><Eyebrow>{group.label}</Eyebrow><h2 id={`${group.id}-heading`}>{group.title}</h2></div><p>{group.description}</p></div>{serviceContent.filter(service => service.groupId === group.id).map(service => <ServiceFeature key={service.id} service={service} index={serviceContent.indexOf(service)} />)}</div></section>)}

    <section className="services-next-step" aria-labelledby="services-next-title"><div className="container services-next-layout"><div><Eyebrow light>START WITH YOUR REQUIREMENT</Eyebrow><h2 id="services-next-title">Let’s define the scope.<br /><em>Then bring it together.</em></h2><p>Share your site location, required service, available drawings and equipment details. Our team in Sanand, Ahmedabad, can discuss the electrical and mechanical requirements for your project.</p></div><div className="services-next-card"><Factory size={29} strokeWidth={1.3} aria-hidden="true" /><h3>For dams. For infrastructure.<br />For industry.</h3><p>Manufacturing, installation and engineering services across Gujarat.</p><ButtonLink to={enquiryHref()}>Contact RAN ENGINEERS</ButtonLink><Link to="/projects" className="services-inline-link">Explore our project portfolio<ArrowUpRight size={17} aria-hidden="true" /></Link></div></div></section>
  </div>;
}
