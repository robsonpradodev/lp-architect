// Template engine for LP Sales MAS
// Replaces {{placeholder}} tokens with lead data

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
  works: string; // JSON array string
  testimonial_text: string;
  testimonial_author: string;
  variant: string;
}

export function fillTemplate(html: string, data: LeadData): string {
  let result = html;
  for (const [key, value] of Object.entries(data)) {
    result = result.replaceAll(`{{${key}}}`, value || '');
  }
  return result;
}

export function buildLeadData(raw: Record<string, any>, variant: string): LeadData {
  const name = raw.name || 'Profissional';
  const firstName = name.split(' ')[0];
  const enriched = raw.enriched_data || {};
  
  // Build WhatsApp CTA link
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
    photo_url: enriched.profile_photo || enriched.photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop&crop=face',
    cta_url: ctaUrl,
    linkedin_url: raw.linkedin_url || '',
    portfolio_url: '',
    skills: (enriched.skills || []).slice(0, 6).join(', '),
    works: '[]',
    testimonial_text: '',
    testimonial_author: '',
    variant,
  };
}
