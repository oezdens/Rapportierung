import { useState } from 'react';
import { Report } from '../App';
import { Search, Filter, ChevronRight, MapPin, Calendar } from 'lucide-react';

type ReportsListProps = {
  reports: Report[];
  onViewReport: (id: string) => void;
};

export function ReportsList({ reports, onViewReport }: ReportsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'offen' | 'in-bearbeitung' | 'abgeschlossen'>('all');

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || report.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="px-6 pt-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rapporte durchsuchen..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-slate-700 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              filterStatus === 'all'
                ? 'bg-slate-800 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Alle ({reports.length})
          </button>
          <button
            onClick={() => setFilterStatus('offen')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              filterStatus === 'offen'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Offen ({reports.filter(r => r.status === 'offen').length})
          </button>
          <button
            onClick={() => setFilterStatus('in-bearbeitung')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              filterStatus === 'in-bearbeitung'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            In Arbeit ({reports.filter(r => r.status === 'in-bearbeitung').length})
          </button>
          <button
            onClick={() => setFilterStatus('abgeschlossen')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              filterStatus === 'abgeschlossen'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Erledigt ({reports.filter(r => r.status === 'abgeschlossen').length})
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="px-6 space-y-3 pb-6">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">Keine Rapporte gefunden</p>
            <p className="text-slate-400 text-sm mt-1">Versuchen Sie eine andere Suche oder Filter</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <div
              key={report.id}
              onClick={() => onViewReport(report.id)}
              className="bg-white rounded-xl p-4 shadow-md border border-slate-100 cursor-pointer hover:shadow-lg transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-slate-900 mb-1">{report.title}</h4>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <MapPin className="w-3 h-3" />
                    <span>{report.location}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 ml-2" />
              </div>

              {/* Photos Preview */}
              {report.photos.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {report.photos.slice(0, 3).map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`Foto ${idx + 1}`}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ))}
                  {report.photos.length > 3 && (
                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 text-sm">
                      +{report.photos.length - 3}
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className={`px-2 py-1 rounded-lg ${
                    report.status === 'offen'
                      ? 'bg-red-100 text-red-700'
                      : report.status === 'in-bearbeitung'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {report.status === 'offen' && 'Offen'}
                    {report.status === 'in-bearbeitung' && 'In Arbeit'}
                    {report.status === 'abgeschlossen' && 'Erledigt'}
                  </span>
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg">
                    {report.category}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-xs">
                  <Calendar className="w-3 h-3" />
                  {new Date(report.createdAt).toLocaleDateString('de-DE')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
