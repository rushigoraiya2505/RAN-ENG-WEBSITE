import { useLocation } from 'react-router-dom';
import { company, products, projects } from './data';
import { metadata, absoluteUrl } from './metadata';
import { serviceContent, serviceGroupContent } from './serviceContent';
import { site, safeHttpUrl } from './site';

type SchemaNode = Record<string, unknown>;
const reference = (id: string) => ({ '@id': id });

/** Escape raw-text script boundaries while retaining valid, parseable JSON. */
export const serializeStructuredData = (value: unknown) => JSON.stringify(value)
  .replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
  .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

export function structuredData(path: string) {
  const meta = metadata(path);
  const organizationId = absoluteUrl('/#organization');
  const websiteId = absoluteUrl('/#website');
  const webpageId = `${meta.canonical}#webpage`;
  const breadcrumbId = `${meta.canonical}#breadcrumb`;
  const contact = site.contact as typeof site.contact & { phones?: readonly string[]; emails?: readonly string[] };
  const phones = [...new Set([contact.phone, ...(contact.phones || [])])].filter(Boolean);
  const emails = [...new Set([contact.email, ...(contact.emails || [])])].filter(Boolean);
  const areaServed = { '@type': 'AdministrativeArea', name: 'Gujarat, India' };
  const organization: SchemaNode = {
    '@type': ['Organization', 'LocalBusiness'], '@id': organizationId,
    name: company.name, url: absoluteUrl('/'),
    logo: { '@type': 'ImageObject', '@id': absoluteUrl('/#logo'), url: absoluteUrl('/images/ran-logo.webp'), contentUrl: absoluteUrl('/images/ran-logo.webp'), width: 360, height: 210, caption: 'RAN ENGINEERS logo' },
    description: 'Electrical and mechanical engineering for dam infrastructure, government projects and industries across Gujarat, with electrical panel manufacturing in Sanand, Ahmedabad.',
    foundingDate: String(company.establishedYear || 2005), areaServed,
    address: { '@type': 'PostalAddress', name: contact.address, streetAddress: 'Plot No. WP-41, Women Industrial Park, GIDC Sanand – II, Village Bol', addressLocality: 'Sanand', addressRegion: 'Gujarat', postalCode: '382170', addressCountry: 'IN' },
    ...(phones.length ? { telephone: phones[0] } : {}),
    ...(emails.length ? { email: emails[0] } : {}),
    ...(phones.length || emails.length ? { contactPoint: [{ '@type': 'ContactPoint', contactType: 'Project enquiries', telephone: phones, email: emails, url: absoluteUrl('/contact'), areaServed }] } : {}),
    ...(safeHttpUrl(contact.mapUrl || '') ? { hasMap: contact.mapUrl } : {}),
    ...(safeHttpUrl(contact.linkedin || '') ? { sameAs: [contact.linkedin] } : {}),
  };
  const website: SchemaNode = { '@type': 'WebSite', '@id': websiteId, url: absoluteUrl('/'), name: company.name, inLanguage: 'en-IN', publisher: reference(organizationId) };
  const webpage: SchemaNode = {
    '@type': meta.pageType, '@id': webpageId, url: meta.canonical, name: meta.title, description: meta.description, inLanguage: 'en-IN',
    isPartOf: reference(websiteId), publisher: reference(organizationId), about: reference(organizationId),
    primaryImageOfPage: { '@type': 'ImageObject', '@id': `${meta.canonical}#primaryimage`, contentUrl: meta.image, url: meta.image, width: meta.imageWidth, height: meta.imageHeight, caption: meta.imageAlt },
  };
  const product = products.find(item => meta.path === `/products/${item.id}`);
  const project = projects.find(item => meta.path === `/projects/${item.id}`);
  const crumbs = [{ name: 'Home', url: absoluteUrl('/') }];
  if (product) crumbs.push({ name: 'Products', url: absoluteUrl('/products') });
  if (project) crumbs.push({ name: 'Projects', url: absoluteUrl('/projects') });
  if (meta.path !== '/') crumbs.push({ name: meta.breadcrumbName, url: meta.canonical });
  const breadcrumb: SchemaNode = { '@type': 'BreadcrumbList', '@id': breadcrumbId, itemListElement: crumbs.map((crumb, index) => ({ '@type': 'ListItem', position: index + 1, name: crumb.name, item: crumb.url })) };
  const graph: SchemaNode[] = [organization, website, webpage];
  if (crumbs.length > 1) { webpage.breadcrumb = reference(breadcrumbId); graph.push(breadcrumb); }
  if (meta.path === '/' || meta.path === '/about' || meta.path === '/contact') webpage.mainEntity = reference(organizationId);
  if (meta.path === '/services') {
    const listId = `${meta.canonical}#services`;
    webpage.mainEntity = reference(listId);
    graph.push({ '@type': 'ItemList', '@id': listId, name: 'RAN ENGINEERS engineering services', numberOfItems: serviceContent.length, itemListElement: serviceContent.map((service, index) => ({ '@type': 'ListItem', position: index + 1, item: reference(absoluteUrl(`/services#${service.id}`)) })) });
    graph.push(...serviceContent.map(service => ({ '@type': 'Service', '@id': absoluteUrl(`/services#${service.id}`), name: service.title, serviceType: service.title, description: service.description, url: absoluteUrl(`/services#${service.id}`), provider: reference(organizationId), areaServed, category: serviceGroupContent.find(group => group.id === service.groupId)?.title, mainEntityOfPage: reference(webpageId), ...(service.productId ? { isRelatedTo: reference(absoluteUrl(`/products/${service.productId}#product`)) } : {}) })));
  }
  if (meta.path === '/products') {
    const listId = `${meta.canonical}#products`;
    webpage.mainEntity = reference(listId);
    graph.push({ '@type': 'ItemList', '@id': listId, name: 'Electrical and engineering products', numberOfItems: products.length, itemListElement: products.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.title, url: absoluteUrl(`/products/${item.id}`) })) });
  }
  if (meta.path === '/projects') {
    const listId = `${meta.canonical}#projects`;
    webpage.mainEntity = reference(listId);
    graph.push({ '@type': 'ItemList', '@id': listId, name: 'RAN ENGINEERS project portfolio', numberOfItems: projects.length, itemListElement: projects.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.title, url: absoluteUrl(`/projects/${item.id}`) })) });
  }
  if (product) {
    const productId = `${meta.canonical}#product`;
    webpage.mainEntity = reference(productId);
    graph.push({ '@type': 'Product', '@id': productId, name: product.title, description: product.description, category: product.category, url: meta.canonical, mainEntityOfPage: reference(webpageId) });
    // Enquiry-based configurations have no invented offer, stock, review, rating or identifier.
    // Representative catalogue imagery is not asserted as a specific manufactured item.
  }
  if (project) { webpage.about = { '@type': 'Thing', name: project.title, description: project.description }; webpage.spatialCoverage = { '@type': 'Place', name: project.location }; }
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function StructuredData() {
  const { pathname } = useLocation();
  return <script id="ran-structured-data" type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(structuredData(pathname)) }} />;
}
