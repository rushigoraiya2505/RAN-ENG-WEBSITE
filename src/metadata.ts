import { products, projects } from './data';
import { site } from './site';

export const allRoutes = ['/', '/about', '/products', '/services', '/projects', '/industries', '/contact', '/privacy', ...products.map(product => `/products/${product.id}`), ...projects.map(project => `/projects/${project.id}`)];
export type PageSchemaType = 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage';
export type MetaTag = { attribute: 'name' | 'property'; key: string; content: string };
export interface PageMetadata {
  path: string; title: string; description: string; canonical: string;
  image: string; imageAlt: string; imageWidth: number; imageHeight: number;
  noindex: boolean; robots: string; pageType: PageSchemaType; breadcrumbName: string; tags: MetaTag[];
}
export const normalizePath = (path: string) => `/${path.split(/[?#]/, 1)[0].replace(/^\/+|\/+$/g, '')}`;
export const absoluteUrl = (path: string) => `${site.url.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

type PageCopy = { title: string; description: string; name: string; type?: PageSchemaType };
const pages: Record<string, PageCopy> = {
  '/': { title: 'RAN ENGINEERS | Electrical & Dam Engineering Gujarat', description: 'Electrical and mechanical engineering for dams and infrastructure in Gujarat. Explore panel manufacturing, gantry crane services and government project experience.', name: 'Home' },
  '/about': { title: 'About RAN ENGINEERS | Engineering Excellence Since 2005', description: 'Discover the RAN ENGINEERS journey since 2005, from electrical contracting to dam engineering, gantry crane overhauling and panel manufacturing in Gujarat.', name: 'About us', type: 'AboutPage' },
  '/products': { title: 'Electrical Panels & Engineering Products | RAN ENGINEERS', description: 'Explore electrical panels, crane controls, cable trays, poles, high-mast lighting and chemical earthing systems from RAN ENGINEERS in Sanand, Ahmedabad.', name: 'Products', type: 'CollectionPage' },
  '/services': { title: 'Electrical & Mechanical Engineering Services | RAN ENGINEERS', description: 'Government electrical contracting, dam engineering, gantry crane installation and overhauling, panel manufacturing and infrastructure services across Gujarat.', name: 'Services', type: 'CollectionPage' },
  '/projects': { title: 'Dam & Port Engineering Projects in Gujarat | RAN ENGINEERS', description: 'View RAN ENGINEERS projects at Kadana, Sani, Karjan and Machhu-II dams and Gujarat Pipavav Port, with actual photographs and confirmed engineering scopes.', name: 'Projects', type: 'CollectionPage' },
  '/industries': { title: 'Industries We Serve | RAN ENGINEERS Gujarat', description: 'Electrical and mechanical engineering applications for dams, cement, steel, power, ports and public infrastructure. Explore relevant RAN ENGINEERS services.', name: 'Industries', type: 'CollectionPage' },
  '/contact': { title: 'Contact RAN ENGINEERS | Electrical Contractor Sanand, Gujarat', description: 'Contact RAN ENGINEERS in Sanand, Ahmedabad, for electrical contracting, dam engineering, gantry crane services and panel manufacturing. Call +91 98246 21034.', name: 'Contact', type: 'ContactPage' },
  '/privacy': { title: 'Privacy Policy | RAN ENGINEERS', description: 'Read how RAN ENGINEERS handles contact details, project enquiries and optional attachments submitted through this website, and how to contact the company.', name: 'Privacy policy' },
};
const productCopy: Record<string, [string, string]> = {
  'electrical-panel-boards': ['Electrical Panel Manufacturer, Ahmedabad | RAN ENGINEERS', 'Electrical panel boards for dam, industrial and commercial projects. Discuss load requirements, configuration and installation with RAN ENGINEERS in Sanand.'],
  'cable-trays': ['Cable Tray Manufacturing & Installation | RAN ENGINEERS', 'Industrial cable trays for organised electrical cable routes. Define materials, dimensions, supports and installation requirements with RAN ENGINEERS.'],
  'electrical-poles': ['Electrical Poles for Infrastructure | RAN ENGINEERS', 'Electrical poles for industrial, public and commercial infrastructure. Explore project-specific pole geometry, mounting and installation requirements.'],
  'crane-control-panels': ['Crane Control Panels for Dams & Ports | RAN ENGINEERS', 'Crane control panels for dam, port and industrial applications. Discuss motor details, operating sequences, control interfaces and panel integration.'],
  'high-mast-lighting': ['High-Mast Lighting Poles & SITC | RAN ENGINEERS', 'High-mast lighting poles for dams and outdoor infrastructure, with supply, installation, testing and commissioning available to the agreed project scope.'],
  'chemical-earthing': ['Chemical Earthing Systems & Installation | RAN ENGINEERS', 'Chemical earthing systems and installation for industrial and commercial electrical projects, with arrangements and testing defined by the approved design.'],
};
const projectCopy: Record<string, [string, string]> = {
  'kadan-dam-gantry-crane-overhauling': ['Gantry Crane Overhauling at Kadana Dam | RAN ENGINEERS', 'Complete mechanical and electrical overhauling of a gantry crane at Kadana Dam, supporting dependable operation and dam maintenance requirements.'],
  'sani-dam-national-flag-lighting': ['National Flag Lighting at Sani Dam | RAN ENGINEERS', 'National flag lighting at Sani Dam to improve visibility and presentation after dark. Explore the supplied project photograph and confirmed scope.'],
  'karjan-dam-power-distribution-panel': ['100 kW Power Panel at Karjan Dam | RAN ENGINEERS', 'Supply, installation, testing and commissioning of a 100 kW power distribution panel at Karjan Dam, Gujarat, with an actual project photograph.'],
  'karjan-dam-gantry-crane-box': ['Gantry Crane Box at Karjan Dam | RAN ENGINEERS', 'Gantry crane box installation at Karjan Dam as part of the crane’s electrical works, supporting the operational requirements of the dam facility.'],
  'pipavav-port-gantry-crane-box': ['Panel Commissioning at Gujarat Pipavav Port | RAN ENGINEERS', 'Electrical control panel commissioning at Gujarat Pipavav Port for crane electrical controls. View the actual project photograph and commissioning scope.'],
  'machhu-ii-dam-high-mast-lighting': ['30 m High-Mast Lighting at Machhu-II Dam | RAN ENGINEERS', 'Supply, installation, testing and commissioning of a 30-metre high-mast lighting system at Machhu-II Dam to support site visibility after dark.'],
};
const productImages: Record<string, { src: string; alt: string; width: number; height: number }> = {
  'electrical-panel-boards': { src: '/images/control-room.webp', alt: 'Representative industrial electrical control room with panel cabinets.', width: 1600, height: 897 },
  'cable-trays': { src: '/images/wire-cable-tray.webp', alt: 'Metal wire-mesh cable trays carrying electrical cables around ceiling services.', width: 1600, height: 1067 },
  'electrical-poles': { src: '/images/electrical-poles.webp', alt: 'Representative street-lighting poles along a road.', width: 1600, height: 2400 },
  'crane-control-panels': { src: '/images/automation-panel.webp', alt: 'Representative electrical control panel with wiring and components.', width: 1600, height: 1069 },
  'high-mast-lighting': { src: '/images/high-mast.webp', alt: 'Representative high-mast pole with floodlights.', width: 1600, height: 1067 },
  'chemical-earthing': { src: '/images/ran-logo.webp', alt: 'RAN ENGINEERS gear, fist and lightning logo.', width: 360, height: 210 },
};

export function metadata(path: string): PageMetadata {
  const clean = normalizePath(path);
  const product = products.find(item => clean === `/products/${item.id}`);
  const project = projects.find(item => clean === `/projects/${item.id}`);
  const copy = pages[clean];
  const [title, description] = product ? productCopy[product.id] || [`${product.title} | RAN ENGINEERS`, product.description]
    : project ? projectCopy[project.id] || [`${project.title} | RAN ENGINEERS`, project.description]
    : copy ? [copy.title, copy.description] : ['Page Not Found | RAN ENGINEERS', 'Find electrical, mechanical and dam engineering services, products and projects from RAN ENGINEERS in Gujarat.'];
  const imageProject = project || projects[clean === '/services' || clean === '/industries' ? 0 : 1];
  const selectedImage = product ? productImages[product.id] : undefined;
  const contactOrUtility = ['/contact', '/privacy'].includes(clean) || !allRoutes.includes(clean);
  const image = selectedImage || (contactOrUtility
    ? { src: '/images/ran-logo.webp', alt: 'RAN ENGINEERS gear, fist and lightning logo.', width: 360, height: 210 }
    : { src: imageProject.image, alt: imageProject.imageAlt, width: imageProject.orientation === 'portrait' ? 960 : 1280, height: imageProject.orientation === 'portrait' ? 1280 : 960 });
  const canonical = absoluteUrl(clean);
  const imageUrl = absoluteUrl(image.src);
  const noindex = !allRoutes.includes(clean);
  const robots = noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large';
  const tags: MetaTag[] = [
    { attribute: 'name', key: 'description', content: description },
    { attribute: 'name', key: 'robots', content: robots },
    { attribute: 'property', key: 'og:type', content: 'website' },
    { attribute: 'property', key: 'og:site_name', content: 'RAN ENGINEERS' },
    { attribute: 'property', key: 'og:locale', content: 'en_IN' },
    { attribute: 'property', key: 'og:title', content: title },
    { attribute: 'property', key: 'og:description', content: description },
    { attribute: 'property', key: 'og:url', content: canonical },
    { attribute: 'property', key: 'og:image', content: imageUrl },
    { attribute: 'property', key: 'og:image:alt', content: image.alt },
    { attribute: 'property', key: 'og:image:type', content: 'image/webp' },
    { attribute: 'property', key: 'og:image:width', content: String(image.width) },
    { attribute: 'property', key: 'og:image:height', content: String(image.height) },
    { attribute: 'name', key: 'twitter:card', content: 'summary_large_image' },
    { attribute: 'name', key: 'twitter:title', content: title },
    { attribute: 'name', key: 'twitter:description', content: description },
    { attribute: 'name', key: 'twitter:image', content: imageUrl },
    { attribute: 'name', key: 'twitter:image:alt', content: image.alt },
  ];
  return { path: clean, title, description, canonical, image: imageUrl, imageAlt: image.alt, imageWidth: image.width, imageHeight: image.height, noindex, robots, pageType: copy?.type || 'WebPage', breadcrumbName: product?.title || project?.title || copy?.name || 'Page not found', tags };
}
