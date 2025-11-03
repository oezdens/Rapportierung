import { useState, useEffect } from 'react';
import { Scan, X, Wifi } from 'lucide-react';

type NFCScannerProps = {
  onScanned: (tag: string) => void;
  onClose: () => void;
};

export function NFCScanner({ onScanned, onClose }: NFCScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  // Simulierte NFC-Tags
  const sampleNFCTags = [
    'NFC-A23-PUMP',
    'NFC-B2-ELEC',
    'NFC-C1-HVAC',
    'NFC-D3-DOOR',
    'NFC-E1-FIRE',
    'NFC-F4-WATER'
  ];

  useEffect(() => {
    if (scanning) {
      // Simuliert das Scannen eines NFC-Tags nach 2 Sekunden
      const timer = setTimeout(() => {
        const randomTag = sampleNFCTags[Math.floor(Math.random() * sampleNFCTags.length)];
        setScanned(true);
        setTimeout(() => {
          onScanned(randomTag);
        }, 800);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [scanning, onScanned]);

  const handleStartScan = () => {
    setScanning(true);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-800 to-slate-950 z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <h3 className="text-white">NFC Scanner</h3>
        <button
          onClick={onClose}
          className="text-white p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Scanner View */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          {/* NFC Icon with Animation */}
          <div className="relative mb-8">
            <div className={`absolute inset-0 flex items-center justify-center ${scanning && !scanned ? 'animate-ping' : ''}`}>
              <div className="w-40 h-40 bg-white/20 rounded-full"></div>
            </div>
            <div className={`absolute inset-0 flex items-center justify-center ${scanning && !scanned ? 'animate-pulse' : ''}`}>
              <div className="w-32 h-32 bg-white/30 rounded-full"></div>
            </div>
            <div className="relative z-10 flex items-center justify-center">
              <div className={`w-24 h-24 bg-white rounded-full flex items-center justify-center ${scanned ? 'bg-green-500' : ''} transition-colors`}>
                {scanned ? (
                  <Wifi className="w-12 h-12 text-white" />
                ) : (
                  <Scan className="w-12 h-12 text-slate-800" />
                )}
              </div>
            </div>
          </div>

          {/* Status Text */}
          <div className="text-white space-y-2">
            {!scanning && !scanned && (
              <>
                <h3 className="text-2xl">Bereit zum Scannen</h3>
                <p className="text-slate-300">Halten Sie Ihr Gerät an den NFC-Tag</p>
              </>
            )}
            {scanning && !scanned && (
              <>
                <h3 className="text-2xl">Suche nach NFC-Tag...</h3>
                <p className="text-slate-300">Bitte halten Sie das Gerät ruhig</p>
              </>
            )}
            {scanned && (
              <>
                <h3 className="text-2xl">Tag erkannt!</h3>
                <p className="text-green-300">Daten werden übertragen...</p>
              </>
            )}
          </div>

          {/* Start Scan Button */}
          {!scanning && !scanned && (
            <button
              onClick={handleStartScan}
              className="mt-12 px-8 py-4 bg-white text-slate-800 rounded-xl hover:bg-slate-50 transition-all shadow-2xl"
            >
              Scan starten
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-6 bg-white/10 backdrop-blur-sm">
        <div className="flex items-start gap-3 text-white">
          <Scan className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm">
              NFC (Near Field Communication) ermöglicht das kontaktlose Auslesen von Tags.
              Halten Sie Ihr Gerät nah an den Tag.
            </p>
            <p className="text-xs text-slate-300 mt-2">
              (Dies ist eine Simulation für Demonstrationszwecke)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
