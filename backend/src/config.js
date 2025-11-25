import dotenv from 'dotenv';

dotenv.config();

const parseOrigins = (value) => {
  if (!value) return true; // allow all
  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (origins.includes('*')) return true;
  return origins;
};

export const config = {
  port: Number(process.env.PORT) || 4000,
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '',
  },
  corsOrigins: parseOrigins(process.env.ALLOWED_ORIGINS),
};
