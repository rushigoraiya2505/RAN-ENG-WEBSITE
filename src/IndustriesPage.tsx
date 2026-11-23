import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Check, MapPin } from 'lucide-react';
import { additionalApplications, focusIndustries } from './industryContent';
import type { IndustrySector } from './industryContent';
import './industries-page.css';

function SectorCard({ industry, index }: { industry: IndustrySector; index: number }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const photo = imageFailed && industry.fallback ? industry.fallback : industry;
  useEffect(() => {
    // A remote image can fail before hydration attaches the error listener.
    if (industry.fallback && imageRef.current?.complete && imageRef.current.naturalWidth === 0) setImageFailed(true);
  }, [industry.fallback]);
  return (
    <article id={industry.id} className={`industry-focus-card industry-focus-${industry.id}`} aria-labelledby={`sector-${industry.id}`}>
      <div className="industry-focus-surface">
        <img ref={imageRef} className="industry-focus-photo" src={photo.image} alt={photo.imageAlt} width={photo.imageWidth} height={photo.imageHeight} style={{ objectPosition: photo.imagePosition }} loading="lazy" decoding="async" onError={() => { if (industry.fallback && !imageFailed) setImageFailed(true); }} />
        <div className="industry-focus-shade" aria-hidden="true" />
        <div className="industry-focus-topline">
          <span className="industry-focus-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        </div>
        <div className="industry-focus-copy">
          <p className="industry-focus-location">{photo.imageType === 'project' && <MapPin size={14} aria-hidden="true" />}{photo.imageLabel}</p>
          <h2 id={`sector-${industry.id}`}>{industry.title}</h2>
          <p className="industry-focus-description">{industry.description}</p>
          <ul className="industry-focus-services" aria-label={`Services for ${industry.title}`}>
            {industry.services.map(service => <li key={service}><Check size={15} aria-hidden="true" /><span>{service}</span></li>)}
          </ul>
          <div className="industry-focus-actions">
            <Link className="industry-explore-link" to={industry.serviceHref} aria-label={`Explore services for ${industry.title}`}>Explore Services</Link>
            {industry.projectHref && <Link className="industry-project-link" to={industry.projectHref}>View project <ArrowUpRight size={15} aria-hidden="true" /></Link>}
          </div>
        </div>
      </div>
    </article>
  );
}

export function IndustriesPage() {
  return (
    <div className="industries-page">
      <section className="industries-hero" aria-labelledby="industries-heading">
        <img className="industries-hero-photo" src="/images/projects/sani-dam-national-flag-lighting.webp" width="1280" height="960" alt="Sani Dam illuminated at night, with white lights along the top and saffron, white and green lighting across its structure." fetchPriority="high" decoding="async" />
        <div className="industries-hero-shade" aria-hidden="true" />
        <div className="container industries-hero-inner">
          <nav className="industries-breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Industries</span></nav>
          <div className="industries-hero-copy">
            <p className="eyebrow on-dark"><span /> INDUSTRIES WE SERVE</p>
            <h1 id="industries-heading">Engineering for<br />essential infrastructure.</h1>
            <p>Electrical and mechanical expertise for dam infrastructure, industrial installations and public works across Gujarat.</p>
            <div className="industries-hero-actions"><a href="#industry-sectors" className="button button-primary">Explore Our Industries</a><Link to="/contact" className="button button-light">Discuss Your Project</Link></div>
          </div>
          <Link className="industries-hero-project" to="/projects/sani-dam-national-flag-lighting"><span><MapPin size={15} aria-hidden="true" /> OUR PROJECT EXPERIENCE</span><strong>National Flag Lighting · Sani Dam</strong><ArrowUpRight size={20} aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="industries-sector-section" id="industry-sectors" aria-labelledby="industry-sectors-heading">
        <div className="container">
          <div className="industries-section-intro">
            <div><p className="eyebrow"><span /> SECTORS & APPLICATIONS</p><h2 id="industry-sectors-heading">Technical capability.<br />Applied where it matters.</h2></div>
            <div><p>From dam crane systems and power distribution to industrial installation and public lighting, we bring electrical and mechanical capabilities together around the requirements of each site.</p><Link to="/services" className="text-link">Explore all engineering services</Link></div>
          </div>
          <nav className="industry-sector-nav" aria-label="Industry sectors">{focusIndustries.map(industry => <a key={industry.id} href={`#${industry.id}`}>{industry.title}</a>)}</nav>
          <div className="industry-focus-grid">{focusIndustries.map((industry, index) => <SectorCard key={industry.id} industry={industry} index={index} />)}</div>
          <div className="industries-provenance"><Link to="/projects" className="text-link">View Our Projects</Link></div>
        </div>
      </section>

      <section className="industries-applications" aria-labelledby="additional-applications-heading">
        <div className="container">
          <div className="industries-application-intro"><p className="eyebrow"><span /> ADDITIONAL APPLICATIONS</p><h2 id="additional-applications-heading">Supporting the wider<br />industrial environment.</h2><p>Our products and installation services also apply across production, commercial and operational spaces. Select an application to explore the relevant engineering scope.</p></div>
          <div className="industry-applications-grid">{additionalApplications.map(application => <article id={application.id} key={application.id}><h3><Link to={application.href}>{application.title}<ArrowUpRight size={18} aria-hidden="true" /></Link></h3><p>{application.description}</p></article>)}</div>
        </div>
      </section>

      <section className="industries-contact-strip" aria-labelledby="industry-contact-heading"><div className="container"><div><p className="eyebrow on-dark"><span /> YOUR PROJECT, OUR ENGINEERING</p><h2 id="industry-contact-heading">Let’s define the right scope<br />for your next installation.</h2><p>Share your site, equipment requirements and drawings with RAN ENGINEERS.</p></div><Link to="/contact" className="button button-primary">Discuss Your Project</Link></div></section>
    </div>
  );
}
