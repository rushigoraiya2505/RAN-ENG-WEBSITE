import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, Phone, MapPin, Navigation, FileText, Building2, Check } from 'lucide-react';
import { Eyebrow, FAQSection } from './components';
import { site } from './site';
import EnquiryForm from './EnquiryForm';
import './contact-page.css';

export function ContactPage() {
  const [params] = useSearchParams(), [mapOpen, setMapOpen] = useState(false);
  const contact = site.contact;
  return <div className="contact-page">
    <section className="contact-hero">
      <div className="container">
        <div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><span>Contact</span></div>
        <div className="contact-hero-grid"><div><Eyebrow light>CONTACT RAN ENGINEERS</Eyebrow><h1>Let’s engineer<br /><em>what comes next.</em></h1><p>From a dam upgrade to a new electrical installation, the right solution starts with a conversation.</p></div><div className="contact-hero-note"><Building2 size={30} strokeWidth={1.4} /><span>BASED IN GUJARAT</span><strong>Sanand, Ahmedabad.</strong><p>Electrical. Mechanical. Manufacturing.<br />Supporting infrastructure since 2005.</p><a href="#enquiry" className="button button-primary"><FileText size={18} />Request a Quote</a></div></div>
      </div>
    </section>
    <section className="section contact-main">
      <div className="container contact-main-grid">
        <div className="contact-direct"><Eyebrow>A DIRECT CONNECTION</Eyebrow><h2>Talk to our team.</h2><p>Share your project location, scope and available drawings. We can discuss the electrical and mechanical requirements for your dam, port, industrial or public infrastructure project.</p>
          <div className="contact-detail"><span className="contact-detail-icon"><Phone size={23} /></span><div><h3>Call us</h3>{contact.phones.map(phone => <a key={phone} href={`tel:${phone.replace(/[^+\d]/g, '')}`}>{phone}</a>)}</div></div>
          <div className="contact-detail"><span className="contact-detail-icon"><Mail size={23} /></span><div><h3>Email us</h3>{contact.emails.map(email => <a key={email} href={`mailto:${email}`}>{email}</a>)}</div></div>
          <div className="contact-detail"><span className="contact-detail-icon"><MapPin size={23} /></span><div><h3>Office & manufacturing address</h3><address>Plot No. WP-41, Women Industrial Park,<br />GIDC Sanand – II, Village Bol,<br />Sanand, Ahmedabad, Gujarat – 382170, India.</address><a className="contact-directions" href={contact.mapUrl} target="_blank" rel="noreferrer">Get Directions <Navigation size={16} /></a></div></div>
          <div className="contact-direct-actions"><a className="button button-dark" href="tel:+919824621034"><Phone size={17} />Call Now</a><a className="button button-outline" href="mailto:sales@ranengineers.com"><Mail size={17} />Send Email</a></div>
          <div className="contact-prepare"><span>HELP US UNDERSTAND YOUR PROJECT</span><ul><li><Check size={16} />Project location and application</li><li><Check size={16} />Required services and equipment</li><li><Check size={16} />Drawings, specifications and schedule</li></ul></div>
        </div>
        <div id="enquiry" className="contact-enquiry-card"><EnquiryForm initialRequirement={params.get('requirement') || ''} /></div>
      </div>
    </section>
    <section className="contact-location" aria-labelledby="location-heading"><div className="container"><div className="contact-location-heading"><div><Eyebrow>FIND US IN SANAND</Eyebrow><h2 id="location-heading">A base for what’s next.</h2></div><a className="button button-outline" href={contact.mapUrl} target="_blank" rel="noreferrer"><Navigation size={18} />Get Directions</a></div><div className="contact-map-panel">{mapOpen ? <iframe title="Google Maps — RAN ENGINEERS, WP-41, Women Industrial Park, Sanand" src={contact.mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /> : <div className="contact-map-cover"><div className="contact-map-grid" aria-hidden="true" /><div className="contact-map-pin"><MapPin size={28} /></div><h3>RAN ENGINEERS</h3><p>Women Industrial Park · GIDC Sanand – II<br />Village Bol, Ahmedabad, Gujarat</p><button className="button button-dark" onClick={() => setMapOpen(true)}>Load Google Maps</button><small>The map loads from Google when selected.</small></div>}</div><p className="contact-location-address">{contact.address}</p></div></section>
    <FAQSection limit={4} />
  </div>;
}
