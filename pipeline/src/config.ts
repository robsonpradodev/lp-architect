import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local from workspace
const envPath = resolve(__dirname, '../../.env.local');
try {
  const envFile = readFileSync(envPath, 'utf-8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch { /* no env file */ }

export const config = {
  supabase: {
    url: process.env.SUPABASE_URL || process.env.PROJECT_URL || '',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  apify: {
    token: process.env.APIFY_TOKEN || '',
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '8697428407:AAEDTANNFcNlpi6qDgyo6eB-KODxAqc2ZNU',
    chatId: process.env.TELEGRAM_CHAT_ID || '8271269949',
  },
  vercel: {
    token: process.env.VERCEL_API_TOKEN || '',
    teamId: process.env.VERCEL_TEAM_ID || '',
  },
  github: {
    token: process.env.GITHUB_ACCESS_TOKEN || '',
  },
};
