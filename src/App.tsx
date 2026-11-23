import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header, Footer, FloatingActions } from './components';
import { HomePage, AboutPage, ProductsPage, ProductDetailPage, ServicesPage, ProjectsPage, ProjectDetailPage, IndustriesPage, ContactPage, PrivacyPage, NotFoundPage } from './pages';
import { metadata } from './metadata';
import { StructuredData } from './StructuredData';
function RouteEffects() {
  const location = useLocation();
  useEffect(() => {
    const meta = metadata(location.pathname);
    document.title = meta.title;
    document.documentElement.lang = 'en-IN';
    meta.tags.forEach(tag => {
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${tag.attribute}="${tag.key}"]`);
      if (!element) { element = document.createElement('meta'); element.setAttribute(tag.attribute, tag.key); document.head.appendChild(element); }
      element.content = tag.content;
    });
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = meta.canonical;
    const hash = location.hash.slice(1);
    const timer = window.setTimeout(() => { if (hash) document.getElementById(decodeURIComponent(hash))?.scrollIntoView({ block: 'start', behavior: 'auto' }); else window.scrollTo({ top: 0, behavior: 'instant' }); }, 60);
    return () => window.clearTimeout(timer);
  }, [location]);
  return null;
}
export default function App() {
  return <><RouteEffects /><StructuredData /><Header /><main id="main" tabIndex={-1}><Routes><Route path="/" element={<HomePage />} /><Route path="/about" element={<AboutPage />} /><Route path="/products" element={<ProductsPage />} /><Route path="/products/:slug" element={<ProductDetailPage />} /><Route path="/services" element={<ServicesPage />} /><Route path="/projects" element={<ProjectsPage />} /><Route path="/projects/:slug" element={<ProjectDetailPage />} /><Route path="/industries" element={<IndustriesPage />} /><Route path="/contact" element={<ContactPage />} /><Route path="/privacy" element={<PrivacyPage />} /><Route path="*" element={<NotFoundPage />} /></Routes></main><Footer /><FloatingActions /></>;
}
