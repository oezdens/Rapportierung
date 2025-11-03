import { useState } from 'react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';

type CameraCaptureProps = {
  onCapture: (photoUrl: string) => void;
  onClose: () => void;
};

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Simulierte Kamera mit Beispielbildern
  const samplePhotos = [
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop'
  ];

  const handleCapture = () => {
    // Simuliert das Aufnehmen eines Fotos
    const randomPhoto = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
    setCapturedPhoto(randomPhoto);
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/50 to-transparent">
        <h3 className="text-white">Kamera</h3>
        <button
          onClick={onClose}
          className="text-white p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Camera View / Preview */}
      <div className="w-full h-full flex items-center justify-center relative">
        {!capturedPhoto ? (
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
            <div className="text-center text-white">
              <Camera className="w-20 h-20 mx-auto mb-4 opacity-50" />
              <p className="text-slate-300">Kamera-Vorschau</p>
              <p className="text-slate-400 text-sm mt-2">(Simulation)</p>
            </div>
          </div>
        ) : (
          <img
            src={capturedPhoto}
            alt="Aufgenommenes Foto"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        {!capturedPhoto ? (
          <div className="flex items-center justify-center">
            <button
              onClick={handleCapture}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:bg-slate-100 transition-all shadow-2xl border-4 border-white/30"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={handleRetake}
              className="px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2 backdrop-blur-sm"
            >
              <RefreshCw className="w-5 h-5" />
              Wiederholen
            </button>
            <button
              onClick={handleConfirm}
              className="px-8 py-3 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              Verwenden
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
