import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { ExternalLink, Copy, Check, QrCode } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

interface QRCodeDisplayProps {
  token: string;
  warrantyCode: string;
  productName?: string;
  serialNumber?: string;
  size?: number;
  showScanButton?: boolean;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  token,
  warrantyCode,
  productName,
  serialNumber,
  size = 140,
  showScanButton = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const { setCurrentPortal, setCustomerLookupQuery } = useERP();

  // Full lookup URL
  const lookupUrl = `${window.location.origin}/warranty?token=${encodeURIComponent(token)}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, lookupUrl, {
        width: size,
        margin: 1,
        color: {
          dark: '#1e293b',
          light: '#ffffff',
        },
      }).catch((err) => console.error('QR code generation error:', err));
    }
  }, [lookupUrl, size]);

  const handleCopy = () => {
    navigator.clipboard.writeText(lookupUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateScan = () => {
    setCustomerLookupQuery(token);
    setCurrentPortal('customer');
  };

  return (
    <div className="flex flex-col items-center bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
      <div className="relative group bg-white p-1 rounded-lg">
        <canvas ref={canvasRef} className="rounded" />
      </div>

      <div className="mt-2 text-center">
        <div className="text-[11px] font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {warrantyCode}
        </div>
        {serialNumber && (
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            SN: {serialNumber}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 mt-2.5">
        <button
          onClick={handleCopy}
          title="Sao chép liên kết tra cứu"
          className="text-xs flex items-center gap-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="text-[11px]">{copied ? 'Đã chép' : 'Copy link'}</span>
        </button>

        {showScanButton && (
          <button
            onClick={handleSimulateScan}
            title="Mô phỏng khách quét QR mở cổng tra cứu"
            className="text-xs flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white font-medium px-2 py-1 rounded transition-colors shadow-xs"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="text-[11px]">Quét QR</span>
          </button>
        )}
      </div>
    </div>
  );
};
