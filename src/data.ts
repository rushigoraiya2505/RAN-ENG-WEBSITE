/**
 * Editable RAN ENGINEERS website content.
 * Project records and photographs come from the supplied company information.
 * Image provenance is recorded in the source documentation.
 * Company claims use supplied information. Product tables describe typical
 * configuration options, with reference sources, rather than certified RAN ratings.
 */
export type ProductCategory = 'Panels' | 'Cable management' | 'Lighting & poles' | 'Earthing';
export interface Specification { label: string; value: string }
export interface Product {
  id: string;
  title: string;
  category: ProductCategory;
  shortDescription: string;
  description: string;
  applications: string[];
  specifications: Specification[];
  specificationReference: { label: string; url: string };
  image: string;
  gallery: string[];
  brochureUrl: string | null;
  enquiryPrompts: string[];
}
export type ServiceGroup = 'Electrical systems' | 'Mechanical services' | 'Lighting & site infrastructure';
export const serviceGroups: ServiceGroup[] = ['Electrical systems', 'Mechanical services', 'Lighting & site infrastructure'];
export interface Service {
  id: string;
  group: ServiceGroup;
  title: string;
  shortDescription: string;
  description: string;
  scope: string[];
  applications: string[];
  image: string;
  imageAlt?: string;
  imageLabel?: string;
}
export interface Industry {
  id: string;
  title: string;
  description: string;
  solutions: string[];
  image: string;
  imageAlt?: string;
  imageLabel?: string;
}
export interface ProcessStep {
  id: string;
  title: string;
  headline: string;
  description: string;
  deliverables: string[];
  image: string;
}
export interface CoreValue {
  id: string;
  title: string;
  description: string;
  icon: 'compass' | 'shield-check' | 'hard-hat' | 'handshake' | 'refresh-cw';
}
export interface FAQ { question: string; answer: string }
export type ProjectCategory = 'Gantry Crane Overhauling' | 'Infrastructure Lighting' | 'Power Distribution Panels' | 'Crane Electrical Works' | 'Panel Commissioning' | 'High-Mast Lighting';
export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  location: string;
  description: string;
  scopeLine?: string;
  scope: string[];
  image: string;
  imageAlt: string;
  imagePosition?: string;
  orientation: 'portrait' | 'landscape';
  gallery: string[];
  sourceTimestamp: string;
}
const specs = (...entries: [string, string][]): Specification[] => entries.map(([label, value]) => ({ label, value }));
const asset = (id: string): string => `/images/${id}.webp`;
const projectAsset = (id: string): string => `/images/projects/${id}.webp`;

export const company = {
  name: 'RAN ENGINEERS',
  tagline: 'Engineering Power. Delivering Reliability.',
  heroHeadline: 'Electrical & Mechanical Engineering for Dam Infrastructure',
  heroDescription: 'RAN ENGINEERS provides electrical panels, installation services, gantry crane overhauling and infrastructure lighting, with a strong focus on dam projects for the Government of Gujarat.',
  aboutHeadline: 'Engineering for dams. Expertise for every site.',
  about: 'RAN ENGINEERS provides electrical and mechanical engineering services with a strong focus on dam infrastructure in Gujarat, including dam projects for the Government of Gujarat. Our work brings together electrical panels, installation services, gantry crane overhauling and infrastructure lighting. We also supply electrical products and undertake relevant port, industrial and commercial electrical works.',
  vision: 'To become a trusted and innovative engineering organisation, contributing to the development of sustainable infrastructure through reliable electrical, mechanical and manufacturing solutions.',
  mission: 'To deliver safe, high-quality and technically sound engineering solutions through continuous improvement, skilled workmanship, responsible project execution and long-term customer relationships.',
  contact: {
    address: 'Plot No. WP-41, Women Industrial Park, GIDC Sanand – II, Village Bol, Sanand, Ahmedabad, Gujarat – 382170, India.',
    phone: '+91 98246 21034',
    phones: ['+91 98246 21034', '+91 99981 13750'],
    whatsapp: '',
    email: 'sales@ranengineers.com',
    emails: ['sales@ranengineers.com', 'ranengineers@gmail.com'],
    businessHours: '',
    mapUrl: 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent('RAN ENGINEERS, Plot No. WP-41, Women Industrial Park, GIDC Sanand II, Village Bol, Sanand, Ahmedabad, Gujarat 382170, India'),
    mapEmbedUrl: 'https://www.google.com/maps?q=' + encodeURIComponent('RAN ENGINEERS, Plot No. WP-41, Women Industrial Park, GIDC Sanand II, Village Bol, Sanand, Ahmedabad, Gujarat 382170, India') + '&output=embed',
  },
  // Founded in 2005, as supplied in the company-history brief. Other unknown facts remain unpublished.
  establishedYear: 2005 as number | null,
  location: 'Sanand, Ahmedabad, Gujarat' as string | null,
  yearsOfExperience: null as number | null,
  projectsCompleted: null as number | null,
  industrialClients: null as number | null,
  manufacturingFacility: null as string | null,
  qualityCertifications: [] as string[],
  clientNames: [] as string[],
  socialLinks: { linkedin: null as string | null, instagram: null as string | null, facebook: null as string | null },
  imageNotice: 'The project portfolio features photographs supplied by RAN ENGINEERS. Other images illustrate product and application contexts; product configurations are confirmed for each enquiry.',
};

export const products: Product[] = [
  {
    id: 'electrical-panel-boards',
    title: 'Electrical Panel Boards',
    category: 'Panels',
    shortDescription: 'Power distribution and control, built around your installation.',
    description: 'Electrical panel boards for dam, industrial and commercial electrical infrastructure. Share your load requirements, single-line diagram and installation conditions so that the panel arrangement, components and enclosure can be defined for the project.',
    applications: ['Dam facility power distribution', 'Industrial and commercial electrical infrastructure', 'Equipment control and integration', 'Electrical upgrades'],
    specifications: specs(
      ['Panel configuration', 'Main distribution, sub-distribution and equipment-control arrangements; floor-standing or wall-mounted construction.'],
      ['Electrical ratings', 'Typical industrial supply: 415 V AC, three-phase, 50 Hz. Incomers, outgoing feeders and busbars are sized to the connected load and fault level.'],
      ['Enclosure and protection', 'Fabricated sheet-steel enclosure for indoor or outdoor installation, with door sealing, cable glands and ventilation suited to the environment.'],
      ['Component specification', 'Incoming and outgoing circuit breakers, copper or aluminium busbars, metering, indicator lamps, terminal blocks and protective-earth connections.'],
      ['Cable entry and dimensions', 'Top or bottom cable entry with removable gland plates and cable space. Cabinet dimensions follow the circuit arrangement and installation layout.'],
      ['Testing and documentation', 'Wiring inspection, insulation and protective-circuit checks, functional testing, circuit identification and electrical drawings.'],
    ),
    specificationReference: { label: 'CPWD electrical works specifications', url: 'https://www.cpwd.gov.in/Publication/CPWD_General_Specification_for_Electrical_Works_Part-I_Internal_2023.pdf' },
    image: asset('electrical-panel-boards'),
    gallery: [asset('control-room'), asset('control-room-warm'), asset('technician')],
    brochureUrl: null,
    enquiryPrompts: ['Single-line diagram or equipment schedule', 'Load and supply details', 'Installation environment', 'Required quantity and delivery location'],
  },
  {
    id: 'cable-trays',
    title: 'Industrial Cable Trays',
    category: 'Cable management',
    shortDescription: 'Organised cable routes for connected industrial spaces.',
    description: 'Cable tray manufacturing for structured electrical cable management. Tray arrangement, material, dimensions, finish and supports are selected against the routing plan, cable loading and site conditions agreed for the installation.',
    applications: ['Manufacturing facilities', 'Warehouses and logistics facilities', 'Commercial electrical services', 'Industrial utility cable routes'],
    specifications: specs(
      ['Tray type and arrangement', 'Perforated tray, solid-bottom tray or ladder-type cable support, arranged for horizontal and vertical cable routes.'],
      ['Material and finish', 'Galvanised steel for general installations; stainless-steel options for appropriate corrosive environments.'],
      ['Width, depth and length', 'Illustrative reference section: 100 mm wide × 60 mm deep × 3,000 mm long. The cable schedule and route determine the required section.'],
      ['Thickness and loading requirements', 'Sheet thickness and reinforcement are selected from cable weight, support span and the selected tray system’s load data.'],
      ['Support arrangement', 'Wall brackets, floor supports or suspended supports, with spacing based on the selected tray’s load-versus-span data.'],
      ['Accessories and quantities', 'Straight connectors, bends, tees, reducers, covers, partitions, supports and bonding accessories, scheduled from the route drawing.'],
    ),
    specificationReference: { label: 'Cable-tray reference dimensions and load data', url: 'https://www.oboindia.com/en-in/products/cable-tray-sks-60-ft-3000-100-yes-1-5-hot-dip-galvanised-steel-6056636.html' },
    image: asset('cable-trays'),
    gallery: [asset('wire-cable-tray'), asset('automation-panel')],
    brochureUrl: null,
    enquiryPrompts: ['Tray layout or route drawing', 'Cable loading and tray dimensions', 'Material and finish requirements', 'Bill of quantities'],
  },
  {
    id: 'electrical-poles',
    title: 'Electrical Poles',
    category: 'Lighting & poles',
    shortDescription: 'Electrical infrastructure shaped to site requirements.',
    description: 'Electrical poles for industrial and infrastructure applications. Pole geometry, mounting arrangement, finish and associated installation requirements are defined from the approved site design and the intended equipment or lighting arrangement.',
    applications: ['Industrial campuses', 'Infrastructure developments', 'Outdoor utility installations', 'Commercial premises'],
    specifications: specs(
      ['Pole type and geometry', 'Tapered octagonal steel poles with single-arm, double-arm or top-mounted lighting arrangements.'],
      ['Height and mounting arrangement', 'Example street-lighting heights: 6 m, 9 m and 12 m. Base-plate mounting with an engineered anchor-bolt arrangement.'],
      ['Material and finish', 'Fabricated steel shaft with a hot-dip galvanised finish for outdoor service.'],
      ['Foundation interface', 'Base plate, anchor-bolt assembly and cable entry coordinated with the approved foundation drawing.'],
      ['Equipment and accessories', 'Lighting brackets, inspection door, internal cable termination and an earthing connection.'],
      ['Site design requirements', 'Structural design considers luminaire weight, bracket projection, wind conditions, terrain and soil bearing capacity.'],
    ),
    specificationReference: { label: 'Octagonal-pole configuration examples', url: 'https://www.ssilpvtltd.com/products/octagonal-poles' },
    image: asset('electrical-poles'),
    gallery: [asset('electrical-poles'), asset('high-mast-sunset')],
    brochureUrl: null,
    enquiryPrompts: ['Site layout and intended application', 'Pole height and mounting requirement', 'Equipment or lighting details', 'Quantity and location'],
  },
  {
    id: 'crane-control-panels',
    title: 'Crane Control Panels',
    category: 'Panels',
    shortDescription: 'Control solutions for coordinated material handling.',
    description: 'Crane control panels for dam, port and industrial material-handling applications. Motor details, operating sequence, control interfaces and the crane supplier’s requirements form the basis for the agreed panel and integration scope.',
    applications: ['Dam gantry cranes', 'Port and industrial cranes', 'Material-handling facilities', 'Crane electrical upgrades'],
    specifications: specs(
      ['Crane and motion configuration', 'Separate control circuits for hoisting, cross travel and long travel, matched to the crane arrangement.'],
      ['Motor and supply details', 'Individual motion feeders selected from motor voltage, current, starting method and duty cycle, with coordinated motor protection.'],
      ['Control architecture', 'Contactor-based motion control, variable-speed drives and PLC interfaces are typical design options.'],
      ['Operator interface', 'Local push buttons, pendant stations or radio-control interfaces, with operating and status indication.'],
      ['Interlocks and protection requirements', 'Emergency-stop circuit, travel limits, motion interlocks, motor protection and brake-control interfaces coordinated with the crane’s safety design.'],
      ['Enclosure and installation conditions', 'Sheet-steel control enclosure with labelled terminals and organised wiring; mounting, sealing and cooling selected for the operating environment.'],
    ),
    specificationReference: { label: 'IEC 60204-32: electrical equipment of hoisting machines', url: 'https://webstore.iec.ch/en/publication/63094' },
    image: asset('crane-control-panels'),
    gallery: [asset('automation-panel'), asset('technician'), asset('control-room')],
    brochureUrl: null,
    enquiryPrompts: ['Crane type and motion details', 'Motor ratings and existing drawings', 'Operating and control requirements', 'New installation or upgrade scope'],
  },
  {
    id: 'high-mast-lighting',
    title: 'High Mast Lighting Poles',
    category: 'Lighting & poles',
    shortDescription: 'Lighting infrastructure for expansive outdoor spaces.',
    description: 'High mast lighting poles with supply, installation, testing and commissioning available within an agreed project scope. Mast, lighting and foundation requirements are established from the site layout, design criteria and installation conditions.',
    applications: ['Dam sites', 'Industrial yards', 'Warehousing and logistics areas', 'Outdoor infrastructure'],
    specifications: specs(
      ['Mast height and configuration', 'Typical reference heights: 12.5 m, 16 m, 20 m, 25 m and 30 m, using sectional tapered steel construction.'],
      ['Lighting arrangement', 'LED floodlights on a luminaire carriage or headframe. Quantity, optics and aiming follow the area layout and illumination objectives.'],
      ['Material and protective finish', 'Hot-dip galvanised steel mast with outdoor hardware; a winch-operated lowering carriage is a typical maintenance option.'],
      ['Foundation and mounting requirements', 'Base-plate mounting on an engineered foundation, with anchor bolts designed for mast loading, site wind conditions and soil capacity.'],
      ['Electrical supply and controls', 'Protected incoming supply, lighting feeders, contactor switching and manual or automatic lighting controls.'],
      ['Installation and commissioning scope', 'Supply, erection, cabling, earthing, lighting aiming, functional checks and commissioning within the agreed Supply, Installation, Testing and Commissioning scope.'],
    ),
    specificationReference: { label: 'High-mast configuration and height examples', url: 'https://www.ssilpvtltd.com/products/high-mast' },
    image: asset('high-mast-lighting'),
    gallery: [asset('high-mast'), asset('high-mast-sunset'), asset('industrial-lighting')],
    brochureUrl: null,
    enquiryPrompts: ['Site layout and lighting objectives', 'Proposed mast locations', 'Available electrical supply', 'Supply-only or complete SITC requirement'],
  },
  {
    id: 'chemical-earthing',
    title: 'Chemical Earthing Systems',
    category: 'Earthing',
    shortDescription: 'Grounding solutions defined by the installation.',
    description: 'Chemical earthing systems and installation services for industrial and commercial electrical projects. Electrode arrangement, materials, connection details and testing requirements are established against the approved design and assessed site conditions.',
    applications: ['Industrial electrical installations', 'Commercial electrical infrastructure', 'Panel and equipment earthing', 'Outdoor lighting infrastructure'],
    specifications: specs(
      ['Electrode type and dimensions', 'Rod or pipe-electrode arrangements, with length, diameter, spacing and electrode quantity determined by the earthing design.'],
      ['Material specification', 'Copper-bonded steel or other suitable electrode material selected for conductivity, soil corrosion conditions and compatibility with connected conductors.'],
      ['Earthing compound requirement', 'Compatible ground-enhancement backfill around the electrode, with quantity calculated from the bore or trench dimensions.'],
      ['Connection and pit arrangement', 'Earth-conductor connection, accessible test point and inspection chamber, with corrosion protection at joints.'],
      ['Site and soil conditions', 'Soil resistivity, available space, seasonal moisture variation, corrosion conditions and existing earthing inform the layout.'],
      ['Testing and acceptance criteria', 'Earth-resistance measurement, connection inspection and continuity checks assessed against the installation’s electrical protection design.'],
    ),
    specificationReference: { label: 'Ground-electrode design and soil-resistivity guidance', url: 'https://www.erico.com/catalog/literature/E907W-WWEN.pdf' },
    image: asset('chemical-earthing'),
    gallery: ['/images/earthing.svg', '/images/earthing-detail.svg'],
    brochureUrl: null,
    enquiryPrompts: ['Approved earthing layout, if available', 'Site and soil information', 'Equipment to be connected', 'Project acceptance and testing requirements'],
  },
];

export const services: Service[] = [
  {
    id: 'industrial-electrical-installation',
    group: 'Electrical systems',
    title: 'Industrial Electrical Installation',
    shortDescription: 'Connecting equipment, utilities and production spaces.',
    description: 'Electrical installation works for industrial facilities, coordinated around the approved drawings, equipment interfaces and site access requirements. Define the supply boundary and installation scope at the enquiry stage to support a clear execution plan.',
    scope: ['Review of project drawings and installation scope', 'Equipment and cable route coordination', 'Electrical installation to the agreed design', 'Testing and handover within the approved scope'],
    applications: ['Manufacturing plants', 'Industrial utilities', 'Factory expansions'],
    image: asset('electrical-panel-boards'),
  },
  {
    id: 'commercial-electrical-installation',
    group: 'Electrical systems',
    title: 'Commercial Electrical Installation',
    shortDescription: 'Practical electrical infrastructure for working environments.',
    description: 'Electrical installation services for commercial premises and infrastructure. The scope can be defined around panel locations, distribution routes, lighting interfaces and other project requirements, with access and coordination considered from the outset.',
    scope: ['Distribution and equipment installation planning', 'Cable routes and support coordination', 'Installation works within the agreed boundary', 'Project-specific testing and handover'],
    applications: ['Commercial buildings', 'Business premises', 'Warehousing facilities'],
    image: asset('cable-trays'),
  },
  {
    id: 'electrical-panel-installation',
    group: 'Electrical systems',
    title: 'Electrical Panel Installation',
    shortDescription: 'From panel positioning to a coordinated connection.',
    description: 'Installation of electrical panels for dam facilities, industrial infrastructure and upgrade projects. Panel position, cable entries, termination details and installation interfaces are reviewed against the approved equipment documentation and site arrangement.',
    scope: ['Panel location and access coordination', 'Mounting and positioning', 'Cable connection within the agreed scope', 'Installation checks and handover documentation'],
    applications: ['Dam facility power distribution', 'Industrial facilities', 'Commercial power distribution', 'Equipment installations'],
    image: projectAsset('karjan-dam-100kw-power-panel'),
    imageAlt: 'Grey power distribution cabinet with meters, indicator lights and breaker compartments beside a stabiliser.',
    imageLabel: 'Karjan Dam · Power distribution panel',
  },
  {
    id: 'crane-panel-integration',
    group: 'Electrical systems',
    title: 'Crane Panel Installation & Integration',
    shortDescription: 'Bringing crane controls and equipment interfaces together.',
    description: 'Crane panel installation and integration for dam, port and industrial material-handling applications. The work is defined around the crane equipment, operating sequence and supplier documentation, with interfaces agreed before installation begins.',
    scope: ['Control and equipment interface review', 'Panel installation and connection', 'Coordination with crane equipment requirements', 'Agreed functional checks and handover'],
    applications: ['Dam gantry crane electrical works', 'Port crane electrical works', 'Industrial material-handling facilities'],
    image: projectAsset('pipavav-port-gantry-crane-box'),
    imageAlt: 'Open stainless-steel crane control box with push buttons, a rotary switch, circuit breakers and wiring.',
    imageLabel: 'Gujarat Pipavav Port · Panel commissioning',
  },
  {
    id: 'high-mast-sitc',
    group: 'Lighting & site infrastructure',
    title: 'High Mast Pole SITC Works',
    shortDescription: 'Supply, installation, testing and commissioning.',
    description: 'High mast lighting works from equipment supply through installation, testing and commissioning. The project scope is agreed against the site layout, foundation interfaces, electrical supply and lighting requirements.',
    scope: ['Supply of agreed mast and associated equipment', 'Site and foundation interface coordination', 'Installation and electrical connection', 'Testing, commissioning and handover'],
    applications: ['Dam sites', 'Industrial yards', 'Logistics facilities', 'Outdoor infrastructure'],
    image: projectAsset('machhu-ii-dam-high-mast-lighting'),
    imageAlt: 'High-mast pole and floodlights above site buildings against a cloudy blue sky.',
    imageLabel: 'Machhu-II Dam · 30 m high-mast lighting',
  },
  {
    id: 'chemical-earthing-installation',
    group: 'Lighting & site infrastructure',
    title: 'Chemical Earthing Installation',
    shortDescription: 'Earthing works coordinated with your electrical design.',
    description: 'Chemical earthing installation for industrial and commercial projects. Electrode locations, materials, connection routes and acceptance criteria are established from the project design and site assessment.',
    scope: ['Review of the approved earthing arrangement', 'Electrode and pit installation', 'Connection works within the agreed scope', 'Testing against project acceptance criteria'],
    applications: ['Industrial equipment', 'Commercial electrical systems', 'Lighting infrastructure'],
    image: asset('chemical-earthing'),
  },
  {
    id: 'cable-tray-installation',
    group: 'Lighting & site infrastructure',
    title: 'Cable Tray Installation',
    shortDescription: 'Well-planned routes for electrical cable management.',
    description: 'Installation of cable trays and associated supports to suit the planned cable route. The work considers site geometry, equipment access, support locations and interfaces with other building or industrial services.',
    scope: ['Route and support layout coordination', 'Tray and accessory installation', 'Equipment and service interface coordination', 'Installation inspection and handover'],
    applications: ['Manufacturing plants', 'Commercial facilities', 'Warehousing and utility areas'],
    image: asset('cable-trays'),
  },
  {
    id: 'electrical-infrastructure-projects',
    group: 'Lighting & site infrastructure',
    title: 'Electrical Infrastructure Projects',
    shortDescription: 'One coordinated scope across electrical requirements.',
    description: 'Electrical infrastructure works bringing together equipment, installation services and lighting for dam, industrial and commercial projects. Define the required equipment, engineering interfaces and site activities to establish a practical scope from enquiry to handover.',
    scope: ['Requirement and supply-boundary definition', 'Equipment and installation coordination', 'Execution of the agreed electrical works', 'Testing and project handover'],
    applications: ['Dam infrastructure and site lighting', 'Industrial facilities', 'Infrastructure developments', 'Commercial upgrades'],
    image: projectAsset('sani-dam-national-flag-lighting'),
    imageAlt: 'Sani Dam illuminated in saffron, white and green at night.',
    imageLabel: 'Sani Dam · Infrastructure lighting',
  },
  {
    id: 'gantry-crane-overhauling',
    group: 'Mechanical services',
    title: 'Gantry Crane Overhauling',
    shortDescription: 'Mechanical and electrical works for dependable crane operation.',
    description: 'Complete mechanical and electrical overhauling of gantry cranes for dam infrastructure. Our work at Kadana Dam focuses on restoring dependable operation and supporting the maintenance requirements of the dam facility. The scope for each enquiry is defined from the crane and site requirements.',
    scope: ['Mechanical overhauling within the agreed scope', 'Electrical overhauling within the agreed scope', 'Work aligned with crane operating and dam maintenance requirements'],
    applications: ['Dam gantry cranes', 'Dam infrastructure maintenance'],
    image: projectAsset('kadan-dam-gantry-crane'),
    imageAlt: 'Yellow gantry crane spanning a dam roadway, with its lifting hook, rails and access ladders visible.',
    imageLabel: 'Kadana Dam · Gantry crane overhauling',
  },
];

export const industries: Industry[] = [
  { id: 'dam-infrastructure', title: 'Dam Infrastructure', description: 'Electrical and mechanical work for dam facilities in Gujarat, including projects for the Government of Gujarat.', solutions: ['Power distribution panels', 'Gantry crane overhauling and electrical works', 'Infrastructure and high-mast lighting'], image: projectAsset('kadan-dam-gantry-crane'), imageAlt: 'Yellow gantry crane spanning the roadway at Kadana Dam.', imageLabel: 'Kadana Dam' },
  { id: 'ports', title: 'Ports & Crane Electrical Works', description: 'Crane electrical equipment and installation scopes, including electrical control panel commissioning at Gujarat Pipavav Port.', solutions: ['Gantry crane boxes', 'Crane control panels', 'Electrical installation'], image: projectAsset('pipavav-port-gantry-crane-box'), imageAlt: 'Open crane control box at Gujarat Pipavav Port with buttons and internal switchgear.', imageLabel: 'Gujarat Pipavav Port' },
  { id: 'manufacturing', title: 'Manufacturing Plants', description: 'Electrical distribution, control and cable management for connected production facilities.', solutions: ['Electrical panel boards', 'Cable trays', 'Industrial electrical installation'], image: asset('electrical-panel-boards') },
  { id: 'steel-metals', title: 'Steel & Metal Industries', description: 'Electrical products and installation scopes for industrial processing and material-handling environments.', solutions: ['Crane control panels', 'Electrical infrastructure', 'Chemical earthing'], image: asset('crane-control-panels') },
  { id: 'cement', title: 'Cement Industries', description: 'Panel, cabling and electrical installation requirements across plant infrastructure.', solutions: ['Electrical panels', 'Cable tray systems', 'Installation services'], image: asset('cable-trays') },
  { id: 'warehousing-logistics', title: 'Warehousing & Logistics', description: 'Electrical distribution and outdoor lighting infrastructure for large operational spaces.', solutions: ['High mast lighting', 'Cable management', 'Commercial electrical installation'], image: asset('high-mast-lighting') },
  { id: 'commercial', title: 'Commercial Infrastructure', description: 'Practical electrical equipment and installation services for commercial premises.', solutions: ['Electrical panel boards', 'Cable trays', 'Chemical earthing installation'], image: asset('electrical-panel-boards') },
  { id: 'construction', title: 'Construction & Infrastructure', description: 'Electrical poles, lighting and installation scopes for developing infrastructure.', solutions: ['Electrical poles', 'High mast SITC', 'Electrical infrastructure works'], image: asset('electrical-poles') },
  { id: 'material-handling', title: 'Material Handling Facilities', description: 'Crane control and electrical interfaces for industrial handling applications.', solutions: ['Crane control panels', 'Panel integration', 'Industrial electrical installation'], image: asset('crane-control-panels') },
  { id: 'utilities', title: 'Industrial Utilities', description: 'Electrical distribution, grounding and cable routes supporting plant utilities.', solutions: ['Electrical panel boards', 'Chemical earthing', 'Cable tray installation'], image: asset('chemical-earthing') },
];
export const industriesNotice = 'Our project portfolio documents dam infrastructure and port crane electrical work. Other sectors shown are product and service applications, without implying specific client relationships.';

export const processSteps: ProcessStep[] = [
  { id: 'requirement', title: 'Requirement', headline: 'Start with what your project needs.', description: 'Share the application, equipment requirements, site information and drawings. Define what is to be supplied, installed and handed over.', deliverables: ['Project brief', 'Required scope', 'Available drawings'], image: asset('electrical-panel-boards') },
  { id: 'engineering', title: 'Engineering', headline: 'Turn the brief into an agreed scope.', description: 'Review configurations, interfaces and installation considerations. Confirm the project-specific details before manufacture or site execution.', deliverables: ['Agreed configuration', 'Interface review', 'Confirmed requirements'], image: asset('crane-control-panels') },
  { id: 'manufacturing', title: 'Manufacturing', headline: 'Build to the approved requirements.', description: 'Manufacture the specified electrical products with the agreed materials, components and configuration, aligned with the confirmed project scope.', deliverables: ['Specified products', 'Configuration checks', 'Supply coordination'], image: asset('electrical-panel-boards') },
  { id: 'installation', title: 'Installation', headline: 'Bring the system together on site.', description: 'Coordinate installation activities with site access, equipment interfaces and the approved layout. Keep responsibilities and supply boundaries clear.', deliverables: ['Site coordination', 'Agreed installation', 'Interface checks'], image: asset('cable-trays') },
  { id: 'testing', title: 'Testing', headline: 'Check against the agreed criteria.', description: 'Carry out the checks and testing defined for the project, with results reviewed against its approved acceptance criteria.', deliverables: ['Project-specific checks', 'Test records as agreed', 'Review of findings'], image: asset('chemical-earthing') },
  { id: 'handover', title: 'Handover', headline: 'Complete the scope with clarity.', description: 'Review the completed scope, relevant documentation and any agreed follow-up items so that the project can move to its next stage.', deliverables: ['Scope review', 'Agreed documentation', 'Handover coordination'], image: asset('high-mast-lighting') },
];

export const values: CoreValue[] = [
  { id: 'engineering', title: 'Engineering Excellence', description: 'Commitment to reliable workmanship and continuous technical improvement.', icon: 'compass' },
  { id: 'quality', title: 'Integrity & Accountability', description: 'Delivering on commitments with transparency and responsibility.', icon: 'shield-check' },
  { id: 'safety', title: 'Safety & Quality', description: 'Prioritising safe operations and dependable engineering outcomes.', icon: 'hard-hat' },
  { id: 'customers', title: 'Customer Commitment', description: 'Understanding project requirements and delivering practical solutions.', icon: 'handshake' },
  { id: 'improvement', title: 'Continuous Growth', description: 'Expanding capabilities, adopting new technologies and developing manufacturing expertise.', icon: 'refresh-cw' },
];

export const faqs: FAQ[] = [
  { question: 'What work does RAN ENGINEERS undertake for dams?', answer: 'Our dam infrastructure work includes electrical panels and installation, complete mechanical and electrical gantry crane overhauling, crane electrical works, infrastructure lighting and high-mast lighting. The portfolio presents supplied project records from Kadana Dam, Sani Dam, Karjan Dam and Machhu-II Dam in Gujarat. Our experience includes dam projects for the Government of Gujarat.' },
  { question: 'What does RAN ENGINEERS manufacture?', answer: 'The product range includes electrical panel boards, industrial cable trays, electrical poles, crane control panels, high mast lighting poles and chemical earthing systems. The configuration and supply scope are confirmed for each enquiry.' },
  { question: 'Can you handle supply and installation together?', answer: 'Yes. Our project records include Supply, Installation, Testing and Commissioning for a power distribution panel and high-mast lighting. Share your requirements so that equipment, site activities and responsibilities can be defined for your project.' },
  { question: 'What information should I include in an enquiry?', answer: 'Include the product or service, quantity, project location and a clear description of the requirement. Drawings, a single-line diagram, a bill of quantities, site photographs and required delivery dates can help define the scope where available.' },
  { question: 'Where can I find electrical ratings and dimensions?', answer: 'Every product page includes typical specifications and options covering construction, electrical arrangements, dimensions, controls and testing. These reference configurations help you prepare an enquiry; the supplied equipment follows its approved drawings, equipment schedule and purchase specification.' },
  { question: 'What does SITC mean?', answer: 'SITC means Supply, Installation, Testing and Commissioning. The exact equipment, installation interfaces and testing responsibilities are confirmed in the agreed project scope.' },
  { question: 'Can I upload drawings with my enquiry?', answer: 'Yes. The enquiry form supports drawing and specification attachments. Submission is available when an enquiry endpoint has been configured; the form will clearly say if online delivery is not yet enabled.' },
];

// Preserve this order: 11.46.12 → 11.46.13 → 11.46.09 → 11.46.10 → 11.46.11 → 11.46.14.
export const projects: Project[] = [
  {
    id: "kadan-dam-gantry-crane-overhauling",
    title: "Complete Mechanical & Electrical Overhauling of Gantry Crane — Kadana Dam",
    category: "Gantry Crane Overhauling",
    location: "Kadana Dam",
    description: "Complete mechanical and electrical overhauling of the gantry crane at Kadana Dam, with a focus on restoring dependable operation and supporting the maintenance requirements of dam infrastructure.",
    scope: ["Complete mechanical overhauling of the gantry crane", "Complete electrical overhauling of the gantry crane"],
    image: "/images/projects/kadan-dam-gantry-crane.webp",
    imageAlt: "Yellow gantry crane spanning a dam roadway, with a lifting hook, rail tracks and access ladders visible.",
    imagePosition: "50% 46%",
    orientation: "portrait",
    gallery: ["/images/projects/kadan-dam-gantry-crane.webp"],
    sourceTimestamp: "11.46.12",
  },
  {
    id: "sani-dam-national-flag-lighting",
    title: "National Flag Lighting — Sani Dam",
    category: "Infrastructure Lighting",
    location: "Sani Dam",
    description: "Lighting work for the national flag installation at Sani Dam, providing illumination for the flag and its setting to improve visibility and presentation after dark.",
    scope: ["Lighting for the national flag installation and its setting"],
    image: "/images/projects/sani-dam-national-flag-lighting.webp",
    imageAlt: "Sani Dam at night, with saffron, white and green illumination across its concrete bays and bright lights along the upper walkway.",
    imagePosition: "50% 38%",
    orientation: "landscape",
    gallery: ["/images/projects/sani-dam-national-flag-lighting.webp"],
    sourceTimestamp: "11.46.13",
  },
  {
    id: "karjan-dam-power-distribution-panel",
    title: "100 kW Power Distribution Panel — Karjan Dam, Gujarat",
    category: "Power Distribution Panels",
    location: "Karjan Dam, Gujarat",
    description: "Supply, installation, testing and commissioning of a 100 kW power distribution panel at Karjan Dam, Gujarat, supporting the electrical distribution requirements of the dam facility.",
    scopeLine: "Supply, Installation, Testing & Commissioning",
    scope: ["Supply of a 100 kW power distribution panel", "Installation, testing and commissioning of the panel"],
    image: "/images/projects/karjan-dam-100kw-power-panel.webp",
    imageAlt: "Grey electrical distribution cabinet with meters, indicator lights and multiple breaker compartments, installed beside a stabiliser in a blue-walled room.",
    imagePosition: "50% 46%",
    orientation: "landscape",
    gallery: ["/images/projects/karjan-dam-100kw-power-panel.webp"],
    sourceTimestamp: "11.46.09",
  },
  {
    id: "karjan-dam-gantry-crane-box",
    title: "Gantry Crane Box Installation — Karjan Dam",
    category: "Crane Electrical Works",
    location: "Karjan Dam",
    description: "Installation of a gantry crane box at Karjan Dam as part of the crane’s electrical works, supporting the operational requirements of the dam facility.",
    scope: ["Installation of a gantry crane box as part of the crane’s electrical works"],
    image: "/images/projects/karjan-dam-gantry-crane-box.webp",
    imageAlt: "Closed metal electrical box beside blue equipment housings and railings along the Karjan Dam roadway.",
    imagePosition: "40% 68%",
    orientation: "portrait",
    gallery: ["/images/projects/karjan-dam-gantry-crane-box.webp"],
    sourceTimestamp: "11.46.10",
  },
  {
    id: "pipavav-port-gantry-crane-box",
    title: "Panel Commissioning — Gujarat Pipavav Port",
    category: "Panel Commissioning",
    location: "Gujarat Pipavav Port",
    description: "Commissioning of an electrical control panel at Gujarat Pipavav Port, supporting the crane’s electrical controls and operational requirements within the port environment.",
    scopeLine: "Electrical Control Panel Commissioning",
    scope: ["Commissioning of the electrical control panel for the crane installation"],
    image: "/images/projects/pipavav-port-gantry-crane-box.webp",
    imageAlt: "Open stainless-steel crane control panel with up and down push buttons, a red rotary switch, circuit breakers and internal wiring.",
    imagePosition: "50% 46%",
    orientation: "portrait",
    gallery: ["/images/projects/pipavav-port-gantry-crane-box.webp"],
    sourceTimestamp: "11.46.11",
  },
  {
    id: "machhu-ii-dam-high-mast-lighting",
    title: "30 m High-Mast Lighting System — Machhu-II Dam",
    category: "High-Mast Lighting",
    location: "Machhu-II Dam",
    description: "Supply, installation, testing and commissioning of a 30-metre high-mast lighting system at Machhu-II Dam, providing elevated lighting coverage to support visibility and site activities after dark.",
    scopeLine: "Supply, Installation, Testing & Commissioning",
    scope: ["Supply of a 30-metre high-mast lighting system", "Installation, testing and commissioning of the lighting system"],
    image: "/images/projects/machhu-ii-dam-high-mast-lighting.webp",
    imageAlt: "Tall high-mast pole with a cluster of floodlights rising above site buildings against a cloudy blue sky.",
    imagePosition: "48% 55%",
    orientation: "portrait",
    gallery: ["/images/projects/machhu-ii-dam-high-mast-lighting.webp"],
    sourceTimestamp: "11.46.14",
  },
];
