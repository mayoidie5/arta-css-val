import { useState } from 'react';
import { CameraOff, X, QrCode } from 'lucide-react';
import { Button } from './ui/button';
import ArtaSurveyImage from '../assets/ARTA-Survey.png';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface QRCodeScannerProps {
  onScanSuccess: (data: string) => void;
  onClose: () => void;
}

export function QRCodeScanner({ onScanSuccess, onClose }: QRCodeScannerProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0D3B66] to-[#3FA7D6] text-white p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <QrCode className="w-5 h-5" />
            ARTA Survey Code
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Camera View */}
        <div className="p-6 space-y-4">
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden aspect-square flex items-center justify-center p-4">
            <ImageWithFallback
              src={ArtaSurveyImage}
              alt="ARTA Survey - Scan this to start"
              className="w-full h-full object-contain"
            />
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Scan this QR code to start your survey
          </p>

          <Button 
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
