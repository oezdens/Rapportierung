import { useState } from 'react';
import { Report } from '../App';
import { ArrowLeft, MapPin, Calendar, User, Tag, Image as ImageIcon, Scan, Edit2, Save, X } from 'lucide-react';

type ReportDetailProps = {
  report: Report;
  onBack: () => void;
  onUpdate: (id: string, updates: Partial<Report>) => void;
};

export function ReportDetail({ report, onBack, onUpdate }: ReportDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState(report.status);
  const [editedAssignedTo, setEditedAssignedTo] = useState(report.assignedTo || '');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const handleSave = () => {
    onUpdate(report.id, {
      status: editedStatus,
      assignedTo: editedAssignedTo || undefined
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedStatus(report.status);
    setEditedAssignedTo(report.assignedTo || '');
    setIsEditing(false);
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Zurück
          </button>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Bearbeiten
            </button>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Title & Status */}
          <div>
            <h2 className="text-slate-900 text-2xl mb-3">{report.title}</h2>
            {isEditing ? (
              <select
                value={editedStatus}
                onChange={(e) => setEditedStatus(e.target.value as Report['status'])}
                className="px-3 py-2 rounded-lg border border-slate-300 focus:border-slate-700 focus:ring-2 focus:ring-slate-200 outline-none"
              >
                <option value="offen">Offen</option>
                <option value="in-bearbeitung">In Bearbeitung</option>
                <option value="abgeschlossen">Abgeschlossen</option>
              </select>
            ) : (
              <span
                className={`inline-block px-3 py-1 rounded-lg text-sm ${
                  report.status === 'offen'
                    ? 'bg-red-100 text-red-700'
                    : report.status === 'in-bearbeitung'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {report.status === 'offen' && 'Offen'}
                {report.status === 'in-bearbeitung' && 'In Bearbeitung'}
                {report.status === 'abgeschlossen' && 'Abgeschlossen'}
              </span>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <MapPin className="w-4 h-4" />
                Standort
              </div>
              <p className="text-slate-900">{report.location}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <Calendar className="w-4 h-4" />
                Datum
              </div>
              <p className="text-slate-900">
                {new Date(report.createdAt).toLocaleDateString('de-DE', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric' 
                })}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <Tag className="w-4 h-4" />
                Kategorie
              </div>
              <p className="text-slate-900">{report.category}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <User className="w-4 h-4" />
                Zugewiesen
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedAssignedTo}
                  onChange={(e) => setEditedAssignedTo(e.target.value)}
                  placeholder="Name eingeben"
                  className="w-full px-2 py-1 rounded border border-slate-300 focus:border-slate-700 focus:ring-1 focus:ring-slate-200 outline-none text-sm"
                />
              ) : (
                <p className="text-slate-900">{report.assignedTo || 'Nicht zugewiesen'}</p>
              )}
            </div>
          </div>

          {/* NFC Tag */}
          {report.nfcTag && (
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-4 border border-slate-300">
              <div className="flex items-center gap-2 text-slate-700 mb-2">
                <Scan className="w-5 h-5" />
                <span>NFC Tag</span>
              </div>
              <p className="text-slate-900">{report.nfcTag}</p>
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <h3 className="text-slate-700 mb-2">Beschreibung</h3>
            <p className="text-slate-600 leading-relaxed">{report.description}</p>
          </div>

          {/* Photos */}
          {report.photos.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 text-slate-700 mb-3">
                <ImageIcon className="w-5 h-5" />
                <h3>Fotos ({report.photos.length})</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {report.photos.map((photo, idx) => (
                  <img
                    key={idx}
                    src={photo}
                    alt={`Foto ${idx + 1}`}
                    onClick={() => setSelectedPhoto(photo)}
                    className="w-full h-40 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Speichern
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedPhoto}
            alt="Vollbild"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
}
