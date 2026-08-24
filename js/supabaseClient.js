import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

if (SUPABASE_URL.startsWith('YOUR_') || SUPABASE_ANON_KEY.startsWith('YOUR_')) {
  console.warn('Chưa cấu hình Supabase trong js/config.js');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
