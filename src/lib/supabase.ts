import { createClient } from '@supabase/supabase-js';

// Reads Vite environment variables. Set these in a .env file at project root:
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// If env vars are missing, don't call createClient with empty strings —
// that causes the client library to throw at runtime (which breaks the whole app).
// Instead export a small safe stub so the app can render and we can show a helpful warning.
let _supabase: any;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. Supabase auth will not work until these are provided.');

  // Minimal safe stub implementing the small supabase surface used in the app.
  // Methods return neutral values so the app doesn't crash; once real env vars are set,
  // this will be replaced by the real client.
  _supabase = {
    auth: {
      async getSession() {
        return { data: { session: null } };
      },
      onAuthStateChange(_cb: any) {
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    },
    from(_table: string) {
      return {
        select: async () => ({ data: null, error: null }),
        insert: async () => ({ data: null, error: null }),
        order: async () => ({ data: null, error: null }),
        // chainable helpers may be used in queries; return this for simplicity
        then: async (cb: any) => cb({ data: null, error: null })
      };
    }
  };

} else {
  _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export const supabase = _supabase;
