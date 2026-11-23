export type IndustryPhotoCredit = {
  title: string;
  photographer: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
};

export type IndustryPhoto = {
  image: string;
  imageWidth: number;
  imageHeight: number;
  imageAlt: string;
  imagePosition: string;
  imageLabel: string;
  imageType: 'project' | 'representative';
  credit?: IndustryPhotoCredit;
};

export type IndustrySector = IndustryPhoto & {
  id: string;
  title: string;
  description: string;
  services: string[];
  serviceHref: string;
  projectHref?: string;
  fallback?: IndustryPhoto;
};

/** Application sectors are not a list of completed clients or contractual relationships. */
export const focusIndustries: IndustrySector[] = [
  {
    id: 'cement',
    title: 'Cement Industry',
    description: 'Electrical distribution, controls and cable management for cement manufacturing and plant infrastructure.',
    services: ['Power distribution & control panels', 'Industrial electrical installation', 'Cable trays & chemical earthing'],
    serviceHref: '/services#industrial-electrical-installation',
    image: '/images/cement-plant-night.webp',
    imageWidth: 1600,
    imageHeight: 979,
    imageAlt: 'Illuminated cement-processing towers, silos, pipework and steel platforms against a deep blue evening sky.',
    imagePosition: '50% 45%',
    imageLabel: 'Cement manufacturing infrastructure',
    imageType: 'representative',
    credit: {
      title: 'Industrial Cement Plant Illuminated at Night',
      photographer: 'Joseph Russo',
      sourceUrl: 'https://www.pexels.com/photo/industrial-cement-plant-illuminated-at-night-29590119/',
      license: 'Pexels License',
      licenseUrl: 'https://www.pexels.com/license/',
    },
    fallback: {
      image: '/images/wire-cable-tray.webp',
      imageWidth: 1600,
      imageHeight: 1067,
      imageAlt: 'Metal wire-mesh cable trays carry electrical cables around a ceiling duct, with bends, support brackets and junction boxes visible.',
      imagePosition: '50% 40%',
      imageLabel: 'Cable management',
      imageType: 'representative',
      credit: {
        title: 'Wire cable tray01',
        photographer: 'Leotard',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Wire_cable_tray01.jpg',
        license: 'Public domain — author release',
        licenseUrl: 'https://commons.wikimedia.org/wiki/File:Wire_cable_tray01.jpg#Licensing',
      },
    },
  },
  {
    id: 'steel-metals',
    title: 'Steel Industry',
    description: 'Electrical systems, crane controls and installation services for steel processing and heavy industrial environments.',
    services: ['Crane control panels & integration', 'Power distribution systems', 'Industrial installation & maintenance'],
    serviceHref: '/services#crane-panel-integration',
    image: 'https://images.pexels.com/photos/6804258/pexels-photo-6804258.jpeg?auto=compress&cs=srgb&w=1600&fm=webp',
    imageWidth: 1600,
    imageHeight: 1067,
    imageAlt: 'Rail-mounted vats of glowing molten metal inside a steelworks.',
    imagePosition: '50% 45%',
    imageLabel: 'Steel processing infrastructure',
    imageType: 'representative',
    credit: {
      title: 'Wagons with Vats of Molten Metal in a Steelworks',
      photographer: 'Bence Szemerey',
      sourceUrl: 'https://www.pexels.com/photo/wagons-with-vats-of-molten-metal-in-a-steelworks-6804258/',
      license: 'Pexels License',
      licenseUrl: 'https://www.pexels.com/license/',
    },
    fallback: {
      image: '/images/crane.webp',
      imageWidth: 1600,
      imageHeight: 1067,
      imageAlt: 'A yellow lifting beam suspended from an overhead crane hook inside an industrial building.',
      imagePosition: '50% 40%',
      imageLabel: 'Industrial lifting',
      imageType: 'representative',
      credit: {
        title: 'Industrial overhead crane in warehouse setting',
        photographer: 'Cemrecan Yurtman',
        sourceUrl: 'https://www.pexels.com/photo/industrial-overhead-crane-in-warehouse-setting-29224602/',
        license: 'Pexels License',
        licenseUrl: 'https://www.pexels.com/license/',
      },
    },
  },
  {
    id: 'dam-infrastructure',
    title: 'Dam & Irrigation Infrastructure',
    description: 'Electrical and mechanical works for Gujarat’s dam facilities, supported by our experience in distribution, crane systems and infrastructure lighting.',
    services: ['Dam electrical & mechanical works', 'Gantry crane overhauling', 'Infrastructure & high-mast lighting'],
    serviceHref: '/services#gantry-crane-overhauling',
    projectHref: '/projects/kadan-dam-gantry-crane-overhauling',
    image: '/images/projects/kadan-dam-gantry-crane.webp',
    imageWidth: 960,
    imageHeight: 1280,
    imageAlt: 'A yellow gantry crane spans the roadway at Kadana Dam, with its hoist, rail-mounted legs, access ladders and green hillside visible.',
    imagePosition: '50% 37%',
    imageLabel: 'Kadana Dam · Gantry crane overhauling',
    imageType: 'project',
  },
  {
    id: 'power-energy',
    title: 'Power & Energy',
    description: 'Panel manufacturing, power distribution and electrical installation for infrastructure and industrial electrical systems.',
    services: ['Electrical panel manufacturing', 'Power distribution panel installation', 'Cable management & earthing'],
    serviceHref: '/services#electrical-panel-installation',
    projectHref: '/projects/karjan-dam-power-distribution-panel',
    image: '/images/projects/karjan-dam-100kw-power-panel.webp',
    imageWidth: 1280,
    imageHeight: 960,
    imageAlt: 'A grey power distribution panel with breaker compartments, meters and indicator lights inside the Karjan Dam electrical room.',
    imagePosition: '48% 40%',
    imageLabel: 'Karjan Dam · 100 kW distribution panel',
    imageType: 'project',
  },
  {
    id: 'ports',
    title: 'Ports & Material Handling',
    description: 'Crane electrical equipment and installation for port and material-handling applications, including electrical control panel commissioning at Gujarat Pipavav Port.',
    services: ['Gantry crane control boxes', 'Crane panel installation & integration', 'Electrical installation & commissioning'],
    serviceHref: '/services#crane-panel-integration',
    projectHref: '/projects/pipavav-port-gantry-crane-box',
    image: '/images/projects/pipavav-port-gantry-crane-box.webp',
    imageWidth: 960,
    imageHeight: 1280,
    imageAlt: 'An open stainless-steel gantry crane control box at Gujarat Pipavav Port, showing push buttons, a rotary switch, breakers, contactors and wiring.',
    imagePosition: '48% 43%',
    imageLabel: 'Gujarat Pipavav Port · Panel commissioning',
    imageType: 'project',
  },
  {
    id: 'municipal-public-infrastructure',
    title: 'Municipal & Public Infrastructure',
    description: 'Street lighting, high-mast installations and public electrical works, bringing together site distribution and infrastructure lighting.',
    services: ['Government electrical contracting', 'Street & high-mast lighting', 'Public electrical infrastructure'],
    serviceHref: '/services#high-mast-sitc',
    projectHref: '/projects/machhu-ii-dam-high-mast-lighting',
    image: '/images/projects/machhu-ii-dam-high-mast-lighting.webp',
    imageWidth: 960,
    imageHeight: 1280,
    imageAlt: 'A high-mast lighting pole with floodlights rises above buildings at Machhu-II Dam against a cloudy blue sky.',
    imagePosition: '50% 24%',
    imageLabel: 'Machhu-II Dam · 30 m high-mast lighting',
    imageType: 'project',
  },
];

export const additionalApplications = [
  { id: 'manufacturing', title: 'Manufacturing Plants', description: 'Panel systems, electrical installation and cable management for production facilities.', href: '/services#industrial-electrical-installation' },
  { id: 'warehousing-logistics', title: 'Warehousing & Logistics', description: 'Electrical distribution, cable routes and outdoor lighting for operational spaces.', href: '/services#high-mast-sitc' },
  { id: 'commercial', title: 'Commercial Infrastructure', description: 'Electrical panels, installation and earthing for commercial premises.', href: '/services#commercial-electrical-installation' },
  { id: 'construction', title: 'Construction & Infrastructure', description: 'Site electrical works, poles, lighting and coordinated installation scopes.', href: '/services#electrical-infrastructure-projects' },
  { id: 'material-handling', title: 'Material Handling Facilities', description: 'Crane control interfaces and panel integration for industrial lifting equipment.', href: '/services#crane-panel-integration' },
  { id: 'utilities', title: 'Industrial Utilities', description: 'Power distribution, grounding and cable routes for supporting plant systems.', href: '/services#chemical-earthing-installation' },
];

export const industryPhotoNotice = 'Our project portfolio documents dam infrastructure and port crane electrical works. Other sectors describe relevant applications of our capabilities. Representative industry photographs do not imply a completed project or client relationship.';
