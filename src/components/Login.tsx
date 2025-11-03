import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export function Login({ onLogin }: { onLogin?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const hasKeys = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!hasKeys) {
        setError('Supabase-Keys nicht konfiguriert. Bitte setze VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY.');
        return;
      }

      if (mode === 'signin') {
        const res = await supabase.auth.signInWithPassword({ email, password });
        if (res.error) throw res.error;
      } else {
        const res = await supabase.auth.signUp({ email, password });
        if (res.error) throw res.error;
      }

      if (onLogin) onLogin();
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-2">RapportApp Anmeldung</h2>
        <p className="text-slate-500 text-sm mb-4">Mit E-Mail und Passwort anmelden (Supabase)</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-600">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
              required
            />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex items-center justify-between gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-slate-800 text-white py-2 rounded hover:opacity-95 disabled:opacity-60"
            >
              {loading ? 'Bitte warten...' : mode === 'signin' ? 'Anmelden' : 'Registrieren'}
            </button>
            <button
              type="button"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-slate-700 underline text-sm"
            >
              {mode === 'signin' ? 'Neues Konto erstellen' : 'Bereits Konto? Anmelden'}
            </button>
          </div>
        </form>

        {/* Hinweistext entfernt auf Wunsch des Nutzers */}
      </div>
    </div>
  );
}

export default Login;
