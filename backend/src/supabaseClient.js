import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

const hasCredentials = Boolean(config.supabase.url && config.supabase.serviceKey);

export const supabaseClient = hasCredentials
  ? createClient(config.supabase.url, config.supabase.serviceKey, {
      auth: { persistSession: false },
    })
  : null;

export const supabaseEnabled = hasCredentials && Boolean(supabaseClient);
