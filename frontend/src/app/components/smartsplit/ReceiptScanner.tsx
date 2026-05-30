import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { parseReceiptImage, ParsedReceipt } from '../../../services/ai/receiptParser';

interface ReceiptScannerProps {
  onScanComplete: (receipt: ParsedReceipt) => void;
  onClose: () => void;
}

export function ReceiptScanner({ onScanComplete, onClose }: ReceiptScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        try {
          const result = await parseReceiptImage(base64data, file.type);
          onScanComplete(result);
        } catch (err: any) {
          setError(err.message || "Failed to parse receipt. Please try again or enter manually.");
        } finally {
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || "Failed to read file.");
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl relative">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Scan Receipt</h2>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
          {isScanning ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mb-4" />
              <p className="text-white font-medium text-lg">Analyzing Receipt...</p>
              <p className="text-white/50 text-sm mt-2 text-center max-w-[250px]">
                Gemini is extracting line items, taxes, and totals.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl flex flex-col items-center gap-3 transition-all group"
              >
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <span className="block text-white font-semibold text-lg">Take Photo</span>
                  <span className="block text-white/50 text-sm">Use your camera</span>
                </div>
              </button>

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-2 transition-all"
              >
                <Upload className="w-5 h-5 text-white/70" />
                <span className="text-white font-medium">Upload from Gallery</span>
              </button>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
