import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = resolve(__dirname, '../templates');
const OUTPUT_DIR = resolve(__dirname, '../output');

export interface LeadData {
  name: string;
  firstName: string;
  role: string;
  role_short: string;
  city: string;
  email: string;
  phone: string;
  photo_url: string;
  cta_url: string;
  linkedin_url: string;
  portfolio_url: string;
  skills: string;
  works: string;
  testimonial_text: string;
  testimonial_author: string;
  variant: string;
}

export function buildLeadData(raw: Record<string, any>, variant: string): LeadData {
  const name = raw.name || 'Profissional';
  const firstName = name.split(' ')[0];
  const enriched = raw.enriched_data || {};
  
  const phone = (raw.phone || '').replace(/\D/g, '');
  const ctaUrl = phone ? `https://wa.me/55${phone}` : '#';

  return {
    name,
    firstName,
    role: raw.role || 'Profissional',
    role_short: (raw.role || 'Pro').split(' ')[0],
    city: enriched.city || 'Brasil',
    email: raw.email || '',
    phone: raw.phone || '',
    photo_url: enriched.profile_photo || enriched.photo_url || 
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop&crop=face',
    cta_url: ctaUrl,
    linkedin_url: raw.linkedin_url || '',
    portfolio_url: '',
    skills: (enriched.skills || []).slice(0, 8).join(', '),
    works: '[]',
    testimonial_text: '',
    testimonial_author: '',
    variant,
  };
}

export function fillTemplate(variant: string, data: LeadData): string {
  const htmlPath = resolve(TEMPLATES_DIR, `${variant}/index.html`);
  let html = readFileSync(htmlPath, 'utf-8');
  
  for (const [key, value] of Object.entries(data)) {
    html = html.replaceAll(`{{${key}}}`, value || '');
  }
  
  return html;
}

export function generatePreview(lead: Record<string, any>): { variantA: string; variantB: string; dataA: LeadData; dataB: LeadData } {
  const dataA = buildLeadData(lead, 'variant-a');
  const dataB = buildLeadData(lead, 'variant-b');
  
  const variantA = fillTemplate('variant-a', dataA);
  const variantB = fillTemplate('variant-b', dataB);
  
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });
  
  const leadId = lead.id || 'test';
  writeFileSync(resolve(OUTPUT_DIR, `${leadId}-variant-a.html`), variantA);
  writeFileSync(resolve(OUTPUT_DIR, `${leadId}-variant-b.html`), variantB);
  
  return { variantA, variantB, dataA, dataB };
}
