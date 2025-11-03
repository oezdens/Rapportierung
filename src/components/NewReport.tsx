import { useState } from 'react';
import { Report } from '../App';
import { supabase } from '../lib/supabase';
import { Camera, Scan, MapPin, FileText, Save, X, Image as ImageIcon } from 'lucide-react';
import { CameraCapture } from './CameraCapture';
import { NFCScanner } from './NFCScanner';

type NewReportProps = {
  onSave: (report: Report) => void;
  onCancel: () => void;
};

export function NewReport({ onSave, onCancel }: NewReportProps) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Wartung');
  const [photos, setPhotos] = useState<string[]>([]);
  const [nfcTag, setNfcTag] = useState<string>('');
  const [showCamera, setShowCamera] = useState(false);
  const [showNFC, setShowNFC] = useState(false);

  const [saving, setSaving] = useState(false);
  const [insertResult, setInsertResult] = useState<any | null>(null);
  const [insertError, setInsertError] = useState<any | null>(null);

  const handleSave = async () => {
    if (!title || !location) {
      alert('Bitte füllen Sie mindestens Titel und Standort aus.');
      return;
    }

    setSaving(true);

    try {
      // get current user id to satisfy RLS WITH CHECK (user_id = auth.uid()) if enabled
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id ?? null;

      const payload = {
        title,
        location,
        description,
        category,
        photos,
        nfc_tag: nfcTag || null,
        status: 'offen',
        assigned_to: null,
        user_id: userId
      };

      const { data, error } = await supabase.from('reports').insert([payload]).select().single();

      setInsertResult(data ?? null);
      setInsertError(error ?? null);

      if (error) {
        console.error('Supabase insert error', error);
        // keep behavior: alert user
        alert('Fehler beim Speichern: ' + error.message);
        return;
      }

      // Map returned row to local Report type
      const saved: Report = {
        id: data.id,
        title: data.title,
        location: data.location,
        description: data.description,
        photos: data.photos ?? [],
        nfcTag: data.nfc_tag ?? undefined,
        status: data.status,
        category: data.category,
        createdAt: data.created_at,
        assignedTo: undefined
      };

      onSave(saved);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoCapture = (photoUrl: string) => {
    setPhotos([...photos, photoUrl]);
    setShowCamera(false);
  };

  const handleNFCScanned = (tag: string) => {
    setNfcTag(tag);
    setShowNFC(false);
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  if (showCamera) {
    return <CameraCapture onCapture={handlePhotoCapture} onClose={() => setShowCamera(false)} />;
  }

  if (showNFC) {
    return <NFCScanner onScanned={handleNFCScanned} onClose={() => setShowNFC(false)} />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Title Input */}
      <div>
        <label className="block text-slate-700 mb-2">Titel *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="z.B. Wartung Pumpe A-23"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-700 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
        />
      </div>

      {/* Location Input */}
      <div>
        <label className="block text-slate-700 mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Standort *
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="z.B. Gebäude A, 2. OG"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-700 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
        />
      </div>

      {/* Category Select */}
      <div>
        <label className="block text-slate-700 mb-2">Kategorie</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-700 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
        >
          <option value="Wartung">Wartung</option>
          <option value="Sicherheit">Sicherheit</option>
          <option value="Schaden">Schaden</option>
          <option value="Inspektion">Inspektion</option>
          <option value="Reinigung">Reinigung</option>
          <option value="Sonstiges">Sonstiges</option>
        </select>
      </div>

      {/* Description Textarea */}
      <div>
        <label className="block text-slate-700 mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Beschreibung
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detaillierte Beschreibung..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-700 focus:ring-2 focus:ring-slate-200 outline-none transition-all resize-none"
        />
      </div>

      {/* NFC Section */}
      <div>
        <label className="block text-slate-700 mb-2">NFC Tag</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={nfcTag}
            readOnly
            placeholder="Kein Tag gescannt"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50"
          />
          <button
            onClick={() => setShowNFC(true)}
            className="px-4 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-colors flex items-center gap-2 shadow-md"
          >
            <Scan className="w-5 h-5" />
            Scannen
          </button>
        </div>
        {nfcTag && (
          <p className="text-green-600 text-sm mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
            Tag erfolgreich gescannt
          </p>
        )}
      </div>

      {/* Photos Section */}
      <div>
        <label className="block text-slate-700 mb-2">Fotos</label>
        <button
          onClick={() => setShowCamera(true)}
          className="w-full px-4 py-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-slate-600"
        >
          <Camera className="w-5 h-5" />
          Foto aufnehmen
        </button>

        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onCancel}
          className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
        >
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

      {/* Debug panel: show last insert result / error (visible only in dev/testing) */}
      <div className="mt-4">
        {insertResult && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
            <strong>DB Insert erfolgreich:</strong>
            <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(insertResult, null, 2)}</pre>
          </div>
        )}
        {insertError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800 mt-2">
            <strong>DB Insert Fehler:</strong>
            <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(insertError, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
