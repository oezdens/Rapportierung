import { Report } from '../App';
import { TrendingUp, Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';

type DashboardProps = {
  reports: Report[];
  onViewAll: () => void;
  onViewReport: (id: string) => void;
};

export function Dashboard({ reports, onViewAll, onViewReport }: DashboardProps) {
  const stats = {
    total: reports.length,
    offen: reports.filter(r => r.status === 'offen').length,
    inBearbeitung: reports.filter(r => r.status === 'in-bearbeitung').length,
    abgeschlossen: reports.filter(r => r.status === 'abgeschlossen').length
  };

  const recentReports = reports.slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-xl mb-2">Willkommen zurück!</h2>
        <p className="text-slate-300">Heute, {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-md border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-slate-700" />
            <span className="text-2xl text-slate-900">{stats.total}</span>
          </div>
          <p className="text-slate-600 text-sm">Gesamt</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-md border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-2xl text-slate-900">{stats.offen}</span>
          </div>
          <p className="text-slate-600 text-sm">Offen</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-md border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="text-2xl text-slate-900">{stats.inBearbeitung}</span>
          </div>
          <p className="text-slate-600 text-sm">In Bearbeitung</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-md border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-2xl text-slate-900">{stats.abgeschlossen}</span>
          </div>
          <p className="text-slate-600 text-sm">Erledigt</p>
        </div>
      </div>

      {/* Recent Reports */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900">Neueste Rapporte</h3>
          <button
            onClick={onViewAll}
            className="text-slate-700 text-sm flex items-center gap-1 hover:gap-2 transition-all"
          >
            Alle anzeigen
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {recentReports.map(report => (
            <div
              key={report.id}
              onClick={() => onViewReport(report.id)}
              className="bg-white rounded-xl p-4 shadow-md border border-slate-100 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-slate-900 flex-1">{report.title}</h4>
                <span
                  className={`px-2 py-1 rounded-lg text-xs ${
                    report.status === 'offen'
                      ? 'bg-red-100 text-red-700'
                      : report.status === 'in-bearbeitung'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {report.status === 'offen' && 'Offen'}
                  {report.status === 'in-bearbeitung' && 'In Arbeit'}
                  {report.status === 'abgeschlossen' && 'Erledigt'}
                </span>
              </div>
              <p className="text-slate-600 text-sm mb-2">{report.location}</p>
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <span>{report.category}</span>
                <span>•</span>
                <span>{new Date(report.createdAt).toLocaleDateString('de-DE')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
