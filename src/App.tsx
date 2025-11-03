import { useEffect, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { NewReport } from './components/NewReport';
import { ReportsList } from './components/ReportsList';
import { ReportDetail } from './components/ReportDetail';
import { Home, Plus, List, Settings } from 'lucide-react';
import Login from './components/Login';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';

export type Report = {
  id: string;
  title: string;
  location: string;
  description: string;
  nfcTag?: string;
  photos: string[];
  status: 'offen' | 'in-bearbeitung' | 'abgeschlossen';
  category: string;
  createdAt: string;
  assignedTo?: string;
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'new' | 'list' | 'detail'>('dashboard');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  
  // Beispieldaten
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      title: 'Wartung Pumpe A-23',
      location: 'Gebäude A, Untergeschoss',
      description: 'Regelmäßige Wartung der Hauptpumpe durchgeführt. Ölstand geprüft und nachgefüllt.',
      nfcTag: 'NFC-A23-PUMP',
      photos: ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop'],
      status: 'abgeschlossen',
      category: 'Wartung',
      createdAt: '2025-11-01T10:30:00',
      assignedTo: 'Max Müller'
    },
    {
      id: '2',
      title: 'Sicherheitsprüfung Elektroverteiler',
      location: 'Gebäude B, 2. OG',
      description: 'Visuelle Inspektion und Messung durchgeführt.',
      nfcTag: 'NFC-B2-ELEC',
      photos: [
        'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop'
      ],
      status: 'in-bearbeitung',
      category: 'Sicherheit',
      createdAt: '2025-11-02T14:15:00',
      assignedTo: 'Sarah Schmidt'
    },
    {
      id: '3',
      title: 'Schadensmeldung Wasserleck',
      location: 'Gebäude C, 1. OG',
      description: 'Kleines Wasserleck an der Decke entdeckt.',
      photos: ['https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800&h=600&fit=crop'],
      status: 'offen',
      category: 'Schaden',
      createdAt: '2025-11-03T09:45:00'
    }
  ]);

  const addReport = (report: Report) => {
    setReports([report, ...reports]);
    setCurrentPage('list');
  };

  const updateReport = (id: string, updates: Partial<Report>) => {
    setReports(reports.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const viewReportDetail = (id: string) => {
    setSelectedReportId(id);
    setCurrentPage('detail');
  };

  const selectedReport = reports.find(r => r.id === selectedReportId);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) setSession(data.session ?? null);
      } catch (e) {
        // ignore
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // When session is available, load reports from Supabase so the app shows persisted data
  useEffect(() => {
    if (!session) return;

    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching reports from Supabase', error);
          return;
        }

        if (!mounted || !data) return;

        const mapped: Report[] = data.map((r: any) => ({
          id: r.id,
          title: r.title,
          location: r.location,
          description: r.description,
          photos: r.photos ?? [],
          nfcTag: r.nfc_tag ?? undefined,
          status: r.status,
          category: r.category,
          createdAt: r.created_at,
          assignedTo: undefined
        }));

        setReports(mapped);
      } catch (e) {
        console.error('Unexpected error loading reports', e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [session]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {/* If not authenticated, show Login */}
      {!session ? (
        <Login onLogin={async () => {
          const { data } = await supabase.auth.getSession();
          setSession(data.session ?? null);
        }} />
      ) : (
      /* Mobile App Container */
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
        {/* Header */}
        <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl">RapportApp</h1>
              <p className="text-slate-300 text-sm mt-1">
                {currentPage === 'dashboard' && 'Übersicht'}
                {currentPage === 'new' && 'Neuer Rapport'}
                {currentPage === 'list' && 'Alle Rapporte'}
                {currentPage === 'detail' && 'Details'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 opacity-80" />
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  setSession(null);
                }}
                className="text-sm text-slate-200 bg-slate-700 px-3 py-1 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="pb-24">
          {currentPage === 'dashboard' && (
            <Dashboard 
              reports={reports} 
              onViewAll={() => setCurrentPage('list')}
              onViewReport={viewReportDetail}
            />
          )}
          {currentPage === 'new' && (
            <NewReport 
              onSave={addReport}
              onCancel={() => setCurrentPage('dashboard')}
            />
          )}
          {currentPage === 'list' && (
            <ReportsList 
              reports={reports}
              onViewReport={viewReportDetail}
            />
          )}
          {currentPage === 'detail' && selectedReport && (
            <ReportDetail 
              report={selectedReport}
              onBack={() => setCurrentPage('list')}
              onUpdate={updateReport}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-200 shadow-lg">
          <div className="flex justify-around items-center px-4 py-3">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                currentPage === 'dashboard'
                  ? 'text-slate-800 bg-slate-100'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs">Home</span>
            </button>
            
            <button
              onClick={() => setCurrentPage('new')}
              className="flex flex-col items-center gap-1 px-6 py-2 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Plus className="w-7 h-7" />
              <span className="text-xs">Neu</span>
            </button>
            
            <button
              onClick={() => setCurrentPage('list')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                currentPage === 'list'
                  ? 'text-slate-800 bg-slate-100'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List className="w-6 h-6" />
              <span className="text-xs">Liste</span>
            </button>
          </div>
        </nav>
      </div>
      )}
    </div>
  );
}

