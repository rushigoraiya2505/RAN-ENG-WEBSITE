import { projects, services } from './data';
import type { Service } from './data';

export interface ServiceImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
  kind: 'project' | 'representative' | 'concept';
  projectId?: string;
  credit?: string;
}

export interface ServiceContent {
  id: string;
  title: string;
  groupId: string;
  description: string;
  scope: string[];
  applications: string[];
  image: ServiceImage;
  relatedProjectIds: string[];
  productId?: string;
  additionalDescription?: string;
  supportingServices?: { service: Service; image?: ServiceImage }[];
}

export const serviceGroupContent = [
  { id: 'service-government-dam-infrastructure', title: 'Government & dam infrastructure', label: 'PUBLIC INFRASTRUCTURE', description: 'Electrical contracting and coordinated engineering for the infrastructure that serves Gujarat.' },
  { id: 'service-mechanical-services', title: 'Mechanical services', label: 'LIFTING & MECHANICAL SYSTEMS', description: 'Gantry crane installation, commissioning and overhauling, with electrical and mechanical requirements considered together.' },
  { id: 'service-electrical-systems', title: 'Electrical systems', label: 'PANELS, POWER & INSTALLATION', description: 'Control panel manufacturing, power distribution and electrical installation for dams, industries and commercial premises.' },
  { id: 'service-lighting-site-infrastructure', title: 'Lighting & site infrastructure', label: 'THE SYSTEMS AROUND THE SITE', description: 'Lighting, cable management and earthing, coordinated around the site layout and its electrical requirements.' },
] as const;

const existing = (id: string): Service => {
  const service = services.find(item => item.id === id);
  if (!service) throw new Error(`Unknown existing service: ${id}`);
  return service;
};

const projectImage = (id: string, caption?: string): ServiceImage => {
  const project = projects.find(item => item.id === id);
  if (!project) throw new Error(`Unknown project: ${id}`);
  return {
    src: project.image, alt: project.imageAlt,
    width: project.orientation === 'portrait' ? 960 : 1280,
    height: project.orientation === 'portrait' ? 1280 : 960,
    caption: caption || `${project.location} · ${project.category}`,
    kind: 'project', projectId: project.id,
  };
};

const kadan = 'kadan-dam-gantry-crane-overhauling';
const sani = 'sani-dam-national-flag-lighting';
const power = 'karjan-dam-power-distribution-panel';
const karjan = 'karjan-dam-gantry-crane-box';
const pipavav = 'pipavav-port-gantry-crane-box';
const mast = 'machhu-ii-dam-high-mast-lighting';

/** Visible service content is also exported for matching Service structured data. */
export const serviceContent: ServiceContent[] = [
  {
    id: 'government-electrical-contracting',
    title: 'Government Electrical Contracting',
    groupId: 'service-government-dam-infrastructure',
    description: 'Government electrical contracting for public infrastructure and dam facilities in Gujarat. RAN ENGINEERS brings together electrical equipment, installation works and site coordination, with experience on dam projects for the Government of Gujarat.',
    scope: ['Electrical equipment and installation requirements', 'Public infrastructure and site lighting works', 'Coordination of equipment, access and site interfaces', 'Testing and handover within the agreed project scope'],
    applications: ['Government infrastructure', 'Dam facilities', 'Public electrical works'],
    image: projectImage(sani, 'Sani Dam · National flag lighting'),
    relatedProjectIds: [sani, mast],
    supportingServices: [{ service: existing('electrical-infrastructure-projects') }],
  },
  {
    id: 'dam-electrical-mechanical-works',
    title: 'Dam Electrical & Mechanical Works',
    groupId: 'service-government-dam-infrastructure',
    description: 'Electrical and mechanical works for dam and irrigation infrastructure across Gujarat. Our services bring together power distribution, crane electrical works, gantry crane overhauling and infrastructure lighting around the requirements of each dam facility.',
    scope: ['Electrical distribution and control equipment', 'Gantry crane electrical and mechanical works', 'High-mast and infrastructure lighting', 'Installation interfaces and dam maintenance requirements'],
    applications: ['Dam infrastructure', 'Irrigation facilities', 'Dam maintenance'],
    image: projectImage(karjan, 'Karjan Dam · Gantry crane box installation'),
    relatedProjectIds: [karjan, kadan],
  },
  {
    id: 'gantry-crane-overhauling',
    title: 'Gantry Crane Installation, Commissioning & Overhauling',
    groupId: 'service-mechanical-services',
    description: 'Gantry crane installation, commissioning and overhauling for dam infrastructure, with mechanical and electrical requirements coordinated around the equipment and site. Each scope is defined against the crane’s operating requirements and the work needed on site.',
    additionalDescription: existing('gantry-crane-overhauling').description,
    scope: ['Installation and commissioning to the agreed project scope', ...existing('gantry-crane-overhauling').scope],
    applications: existing('gantry-crane-overhauling').applications,
    image: projectImage(kadan, 'Kadana Dam · Complete mechanical & electrical gantry crane overhauling'),
    relatedProjectIds: [kadan],
    productId: 'crane-control-panels',
  },
  {
    id: 'mechanical-engineering-services',
    title: 'Mechanical Engineering Services',
    groupId: 'service-mechanical-services',
    description: 'Mechanical engineering services centred on gantry crane equipment and dam infrastructure. Mechanical and electrical work is coordinated around equipment condition, operating requirements and the agreed installation or maintenance scope.',
    scope: ['Mechanical work for dam gantry crane equipment', 'Coordination with crane electrical systems', 'Equipment and site interface review', 'Project-specific installation, commissioning and overhaul requirements'],
    applications: ['Gantry crane equipment', 'Dam infrastructure', 'Electrical and mechanical interfaces'],
    image: projectImage(pipavav, 'Related electrical interface · Panel commissioning at Gujarat Pipavav Port'),
    relatedProjectIds: [kadan, pipavav],
  },
  {
    id: 'electrical-control-panel-manufacturing',
    title: 'Electrical Control Panel Manufacturing',
    groupId: 'service-electrical-systems',
    description: 'Electrical control panel manufacturing in Sanand, Ahmedabad, for dam infrastructure and industrial applications. Panel configuration, component requirements and equipment interfaces are defined around the agreed electrical design and project requirements.',
    scope: ['Electrical control and crane panel requirements', 'Panel configuration and component coordination', 'Manufacturing to approved project requirements', 'Supply and installation interface coordination'],
    applications: ['Dam electrical systems', 'Crane controls', 'Industrial equipment'],
    image: { src: '/images/about/switchboard-inspection.webp', alt: 'Two people inspecting a row of electrical switchboard cabinets with meters, switches and indicator lights.', width: 500, height: 375, caption: 'Electrical switchboard inspection', kind: 'representative' },
    relatedProjectIds: [power, pipavav],
    productId: 'electrical-panel-boards',
    supportingServices: [{ service: existing('crane-panel-integration'), image: projectImage(pipavav, 'Gujarat Pipavav Port · Panel commissioning') }],
  },
  {
    id: 'power-distribution-systems',
    title: 'Power Distribution Systems',
    groupId: 'service-electrical-systems',
    description: 'Power distribution systems for dam facilities, industrial infrastructure and equipment installations. Our scope can include electrical panel supply, installation, testing and commissioning, coordinated with the approved electrical design and the site’s distribution requirements.',
    scope: ['Power distribution panel requirements', 'Equipment locations and electrical interfaces', 'Supply, installation, testing and commissioning as agreed', 'Project-specific checks and handover'],
    applications: ['Dam power distribution', 'Industrial facilities', 'Infrastructure upgrades'],
    image: projectImage(power, 'Karjan Dam, Gujarat · 100 kW power distribution panel SITC'),
    relatedProjectIds: [power],
    productId: 'electrical-panel-boards',
    supportingServices: [{ service: existing('electrical-panel-installation') }],
  },
  {
    id: 'industrial-electrical-installation',
    title: 'Industrial Electrical Installations',
    groupId: 'service-electrical-systems',
    description: existing('industrial-electrical-installation').description,
    scope: existing('industrial-electrical-installation').scope,
    applications: existing('industrial-electrical-installation').applications,
    image: { src: '/images/about/switchgear-installation.webp', alt: 'Two people working beside a row of grey electrical switchgear cabinets beneath an industrial roof.', width: 375, height: 282, caption: 'Electrical switchgear installation', kind: 'representative' },
    relatedProjectIds: [power],
    productId: 'cable-trays',
    supportingServices: [{ service: existing('commercial-electrical-installation'), image: { src: '/images/about/overhead-services-installation.webp', alt: 'Workers using a ladder and access equipment beneath metal ductwork and pipes inside a building under construction.', width: 1024, height: 768, caption: 'Overhead services installation', kind: 'representative' } }],
  },
  {
    id: 'high-mast-sitc',
    title: 'High-Mast Lighting Installation',
    groupId: 'service-lighting-site-infrastructure',
    description: existing('high-mast-sitc').description,
    scope: existing('high-mast-sitc').scope,
    applications: existing('high-mast-sitc').applications,
    image: projectImage(mast, 'Machhu-II Dam · 30 m high-mast lighting system SITC'),
    relatedProjectIds: [mast],
    productId: 'high-mast-lighting',
  },
  {
    id: 'street-lighting-infrastructure',
    title: 'Street Lighting Infrastructure',
    groupId: 'service-lighting-site-infrastructure',
    description: 'Street lighting infrastructure for municipal and public environments, bringing lighting equipment and electrical installation together. The scope is established around pole locations, supply interfaces, installation access and the lighting requirements of the site.',
    scope: ['Lighting equipment and pole requirements', 'Location and electrical supply coordination', 'Installation works to the agreed layout', 'Project-specific testing and handover'],
    applications: ['Municipal infrastructure', 'Public roads', 'Infrastructure developments'],
    image: { src: '/images/electrical-poles.webp', alt: 'Street-lighting poles arranged along a road beneath an open sky.', width: 1600, height: 2400, caption: 'Street-lighting infrastructure', kind: 'representative', credit: 'Yilin Mo / Pexels' },
    relatedProjectIds: [sani],
    productId: 'electrical-poles',
  },
  {
    id: 'cable-tray-installation',
    title: 'Cable Tray Installation',
    groupId: 'service-lighting-site-infrastructure',
    description: existing('cable-tray-installation').description,
    scope: existing('cable-tray-installation').scope,
    applications: existing('cable-tray-installation').applications,
    image: { src: '/images/wire-cable-tray.webp', alt: 'Metal wire-mesh cable trays carry electrical cables around a ceiling duct, with bends, support brackets and junction boxes visible.', width: 1600, height: 1067, caption: 'Wire-mesh cable tray and cable support installation', kind: 'representative', credit: 'Leotard / Public domain' },
    relatedProjectIds: [],
    productId: 'cable-trays',
  },
  {
    id: 'chemical-earthing-installation',
    title: 'Chemical Earthing',
    groupId: 'service-lighting-site-infrastructure',
    description: existing('chemical-earthing-installation').description,
    scope: existing('chemical-earthing-installation').scope,
    applications: existing('chemical-earthing-installation').applications,
    image: { src: '/images/earthing-detail.svg', alt: 'Concept diagram showing an earthing electrode connection, clamp and inspection chamber below ground level.', width: 1200, height: 900, caption: 'Conceptual earthing connection · Illustrative arrangement', kind: 'concept' },
    relatedProjectIds: [],
    productId: 'chemical-earthing',
  },
];
