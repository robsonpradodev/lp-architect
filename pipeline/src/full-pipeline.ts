import fetch from 'node-fetch';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { generatePreview, buildLeadData } from './builder.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(__dirname, '../output');

// ── Mock LinkedIn lead for testing ────────────────────────────
const MOCK_LEAD = {
  id: 'test-lead-001',
  source: 'linkedin',
  segment: 'curriculum',
  name: 'Maria Fernanda Costa',
  email: 'mariafernanda@email.com',
  phone: '31987654321',
  linkedin_url: 'https://linkedin.com/in/mariafernandacosta',
  role: 'UX Designer',
  enriched_data: {
    city: 'Belo Horizonte, MG',
    profile_photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1000&fit=crop&crop=face',
    skills: ['UX Design', 'Figma', 'Design System', 'User Research', 'Prototyping', 'UI Design', 'Wireframing', 'Design Thinking'],
    open_to_work: true,
    has_photo: true,
    profile_completeness: 90,
    last_active_days: 3,
    has_website: false,
    headline: 'UX Designer | Ex-Nubank | Design Systems',
    connections: 500,
    experience_years: 4,
  },
};

// ── Qualification ─────────────────────────────────────────────
function qualifyLead(lead: typeof MOCK_LEAD): { score: number; qualified: boolean; reasons: string[] } {
  const enriched = lead.enriched_data;
  let score = 0;
  const reasons: string[] = [];

  if (enriched.open_to_work) { score += 30; reasons.push('open to work (+30)'); }
  if (enriched.has_photo) { score += 10; reasons.push('has photo (+10)'); }
  if (enriched.profile_completeness > 70) { score += 15; reasons.push('profile complete (+15)'); }
  if (enriched.last_active_days < 30) { score += 10; reasons.push('recently active (+10)'); }
  if (!enriched.has_website) { score += 20; reasons.push('no website (+20)'); }
  if (lead.phone) { score += 15; reasons.push('has phone (+15)'); }

  return { score, qualified: score >= 50, reasons };
}

// ── Telegram sender ───────────────────────────────────────────
async function sendToTelegram(message: string, imagePath?: string): Promise<void> {
  const { botToken, chatId } = config.telegram;
  
  if (imagePath) {
    // Send photo with caption
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('caption', message);
    formData.append('parse_mode', 'Markdown');
    
    const imageBuffer = readFileSync(imagePath);
    formData.append('photo', new Blob([imageBuffer]), 'preview.png');
    
    const resp = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      body: formData,
    });
    const result = await resp.json() as any;
    if (!result.ok) {
      console.error('Telegram sendPhoto failed:', result);
      // Fallback to text
      await sendTelegramText(message);
    } else {
      console.log('✅ Sent photo to Telegram');
    }
  } else {
    await sendTelegramText(message);
  }
}

async function sendTelegramText(message: string): Promise<void> {
  const { botToken, chatId } = config.telegram;
  const resp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }),
  });
  const result = await resp.json() as any;
  if (!result.ok) {
    console.error('Telegram sendMessage failed:', result);
  } else {
    console.log('✅ Sent message to Telegram');
  }
}

// ── Deploy to Vercel ──────────────────────────────────────────
async function deployToVercel(html: string, leadId: string, variant: string): Promise<string> {
  // For now, just return the static file path
  // In production, this would deploy a subdirectory to Vercel
  const filename = `${leadId}-${variant}.html`;
  const filePath = resolve(OUTPUT_DIR, filename);
  writeFileSync(filePath, html);
  console.log(`📄 Saved: ${filePath}`);
  return filePath;
}

// ── Main pipeline ─────────────────────────────────────────────
async function runPipeline() {
  console.log('🚀 Starting LP Sales Pipeline Test Run\n');
  
  // Step 1: Scout (mock)
  const lead = MOCK_LEAD;
  console.log(`🔍 Scout: Found lead "${lead.name}" (${lead.role})`);
  console.log(`   Source: LinkedIn | City: ${lead.enriched_data.city}`);
  console.log(`   Open to work: ${lead.enriched_data.open_to_work}\n`);
  
  // Step 2: Qualify
  const qualification = qualifyLead(lead);
  console.log(`✅ Qualify: Score ${qualification.score}/100 — ${qualification.qualified ? 'QUALIFIED' : 'NOT QUALIFIED'}`);
  console.log(`   Reasons: ${qualification.reasons.join(', ')}\n`);
  
  if (!qualification.qualified) {
    console.log('❌ Lead did not qualify. Stopping pipeline.');
    return;
  }
  
  // Step 3: Builder — Generate previews
  console.log('🎨 Builder: Generating landing page previews...');
  const { variantA, variantB, dataA, dataB } = generatePreview(lead);
  console.log(`   ✅ Variant A (Editorial Light) generated`);
  console.log(`   ✅ Variant B (Bold Dark) generated\n`);
  
  // Step 4: Deploy
  console.log('🚀 Deployer: Saving preview files...');
  const pathA = await deployToVercel(variantA, lead.id, 'variant-a');
  const pathB = await deployToVercel(variantB, lead.id, 'variant-b');
  console.log(`   ✅ Files saved\n`);
  
  // Step 5: Send to Robson via Telegram
  console.log('📤 Sending to Robson via Telegram...');
  
  const message = `🎯 *LP SALES PIPELINE — TEST RUN*

👤 *Lead:* ${lead.name}
💼 *Role:* ${lead.role}
📍 *City:* ${lead.enriched_data.city}
📊 *Score:* ${qualification.score}/100
🔗 *LinkedIn:* ${lead.linkedin_url}

━━━━━━━━━━━━━━━━

*🅰️ VARIANT A — Editorial Light*
Clean, serif, photo-forward portfolio style
Warm sand background, generous white space

*🅱️ VARIANT B — Bold Dark*
Agency style, bold typography, dark bg
Orange/teal accent palette, prominent photo

━━━━━━━━━━━━━━━━

*Qualification:*
${qualification.reasons.map(r => `• ${r}`).join('\n')}

*Next:*
Which variant converts better?
Should we adjust the message copy?
Is the price point right (R$149)?`;

  await sendToTelegram(message);
  
  // Send each variant as a separate message with the HTML content summary
  const summaryA = `🅰️ *VARIANT A — Preview Details*

📝 *Skills:* ${dataA.skills}
📞 *CTA:* WhatsApp (${dataA.cta_url})
🎨 *Style:* Editorial Light — Instrument Serif + DM Sans
📸 *Photo:* Profile photo in hero section

*Modules:* Hero → Stats → About → Services → Work → CTA`;

  const summaryB = `🅱️ *VARIANT B — Preview Details*

📝 *Skills:* ${dataB.skills}
📞 *CTA:* WhatsApp (${dataB.cta_url})
🎨 *Style:* Bold Dark — Archivo + Space Grotesk
📸 *Photo:* Split hero with photo on right

*Modules:* Hero → Marquee → About → Services → Work → Testimonial → CTA`;

  await sendToTelegram(summaryA);
  await sendToTelegram(summaryB);
  
  console.log('\n✅ Pipeline complete! Check your Telegram.');
}

runPipeline().catch(console.error);
