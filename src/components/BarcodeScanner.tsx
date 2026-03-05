// Reusable barcode scanner component using @zxing/browser
import { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  active: boolean;
}

const BarcodeScanner = ({ onScan, active }: BarcodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannedRef = useRef(false);

  const stop = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
    }
    scannedRef.current = false;
  }, []);

  useEffect(() => {
    if (!active) {
      stop();
      return;
    }

    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;
    scannedRef.current = false;

    reader
      .decodeFromVideoDevice(null, videoRef.current!, (result, err) => {
        if (result && !scannedRef.current) {
          scannedRef.current = true;
          onScan(result.getText());
        }
        if (err && !(err instanceof NotFoundException)) {
          // Ignore not-found (no barcode in frame yet)
        }
      })
      .catch(() => {
        setError("Camera access denied or unavailable.");
      });

    return () => stop();
  }, [active, onScan, stop]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className="h-full w-full rounded-xl object-cover"
      muted
      playsInline
    />
  );
};

export default BarcodeScanner;
