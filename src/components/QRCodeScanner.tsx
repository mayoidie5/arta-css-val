import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, X } from 'lucide-react';
import { Button } from './ui/button';
import jsQR from 'jsqr';

interface QRCodeScannerProps {
  onScanSuccess: (data: string) => void;
  onClose: () => void;
}

export function QRCodeScanner({ onScanSuccess, onClose }: QRCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  const scanIntervalRef = useRef<ReturnType<typeof setInterval>>();

  // Decode QR code from canvas
  const decodeQRCode = (canvas: HTMLCanvasElement) => {
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Use jsQR to detect QR code
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        console.log('QR Code detected:', code.data);
        return code.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error decoding QR:', error);
      return null;
    }
  };

  // Initialize camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        setCameraError('');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        } as any);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);

          // Start scanning loop
          scanIntervalRef.current = setInterval(() => {
            if (videoRef.current && canvasRef.current) {
              const canvas = canvasRef.current;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;
                ctx.drawImage(videoRef.current, 0, 0);
                
                // Try to decode QR
                const qrData = decodeQRCode(canvas);
                if (qrData) {
                  onScanSuccess(qrData);
                }
              }
            }
          }, 300);
        }
      } catch (error: any) {
        console.error('Camera error:', error);
        setCameraError(error.message || 'Unable to access camera. Please check permissions.');
        setIsCameraActive(false);
      }
    };

    startCamera();

    return () => {
      // Cleanup
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0D3B66] to-[#3FA7D6] text-white p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold flex items-center gap-3">
            {isCameraActive ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
            Scan QR Code
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
          {cameraError ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-700 text-sm font-medium mb-3">{cameraError}</p>
              <p className="text-red-600 text-xs mb-4">
                Please ensure your browser has camera access and try again.
              </p>
              <Button 
                onClick={onClose}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Close
              </Button>
            </div>
          ) : (
            <>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* QR Scanning Frame */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-4 border-transparent rounded-xl" 
                    style={{
                      background: 'linear-gradient(45deg, #3FA7D6 25%, transparent 25%, transparent 75%, #3FA7D6 75%, #3FA7D6), linear-gradient(45deg, #3FA7D6 25%, transparent 25%, transparent 75%, #3FA7D6 75%, #3FA7D6)',
                      backgroundSize: '30px 30px',
                      backgroundPosition: '0 0, 15px 15px',
                    }}
                  >
                    <div className="w-full h-full border-4 border-[#3FA7D6] rounded-lg flex items-center justify-center">
                      <div className="text-white text-center">
                        <p className="text-sm font-medium">Point camera at QR code</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Position the QR code within the frame and hold steady
              </p>

              <Button 
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Cancel Scan
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
