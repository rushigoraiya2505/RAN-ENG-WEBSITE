import { company } from './data';

const env = import.meta.env;
const configured = (value: string | null) => value && !/^\[.*\]$/.test(value) ? value : '';
export const site = {
  url: (env.VITE_SITE_URL || 'https://www.ranengineers.com').replace(/\/$/, ''),
  enquiryEndpoint: env.VITE_ENQUIRY_ENDPOINT || '/api/enquiries',
  enquiryTokenEndpoint: '/api/enquiry-token',
  contact: {
    address: env.VITE_CONTACT_ADDRESS || configured(company.contact.address), phone: env.VITE_CONTACT_PHONE || configured(company.contact.phone),
    phones: company.contact.phones, emails: company.contact.emails,
    whatsapp: env.VITE_WHATSAPP_NUMBER || configured(company.contact.whatsapp), email: env.VITE_CONTACT_EMAIL || configured(company.contact.email),
    hours: env.VITE_BUSINESS_HOURS || configured(company.contact.businessHours), mapUrl: env.VITE_MAP_URL || configured(company.contact.mapUrl),
    mapEmbedUrl: env.VITE_MAP_EMBED_URL || configured(company.contact.mapEmbedUrl), linkedin: env.VITE_LINKEDIN_URL || configured(company.socialLinks.linkedin),
  },
  company,
};
const media: Record<string, string> = {
  'electrical-panel-boards': 'control-room', 'cable-trays': 'wire-cable-tray',
  'electrical-poles': 'electrical-poles', 'crane-control-panels': 'automation-panel',
  'high-mast-lighting': 'high-mast', 'chemical-earthing': 'earthing',
};
export function mediaFor(src: string) {
  const name = src.replace('/images/', '').replace('.webp', '');
  if (src.endsWith('.svg')) return src;
  const target = media[name] || name;
  return `/images/${target}.${target.startsWith('earthing') ? 'svg' : 'webp'}`;
}
export function galleryFor(id: string): string[] {
  const extra: Record<string, string[]> = {
    'electrical-panel-boards': ['control-room', 'control-room-warm', 'technician'],
    'cable-trays': ['wire-cable-tray', 'automation-panel'],
    'electrical-poles': ['electrical-poles', 'high-mast-sunset'],
    'crane-control-panels': ['automation-panel', 'technician', 'control-room'],
    'high-mast-lighting': ['high-mast', 'high-mast-sunset', 'industrial-lighting'],
    'chemical-earthing': ['earthing', 'earthing-detail'],
  };
  return (extra[id] || [media[id] || 'control-room']).map(name => `/images/${name}.webp`);
}
export const enquiryHref = (requirement = '') => `/contact/${requirement ? `?requirement=${encodeURIComponent(requirement)}` : ''}#enquiry`;
export const safeHttpUrl = (url: string) => /^https?:\/\//i.test(url) ? url : '';
