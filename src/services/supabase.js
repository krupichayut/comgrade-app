import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('supabase_url');
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase_key');
export const supabaseAppId = import.meta.env.VITE_SUPABASE_APP_ID || localStorage.getItem('supabase_appid') || "com_primary_attendance";

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Mock initial data structure to simulate DB when offline
export const localDb = {
  classes: ["ป.1/1", "ป.2/1", "ป.3/1", "ป.4/1", "ป.5/1", "ป.6/1"],
  students: [],
  attendance: {}, 
  scores: {},     
  homework: [],
  lessonPlans: {},
  idCounter: 1,
  hwCounter: 1,
  lpCounter: 1
};
