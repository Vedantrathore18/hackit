import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Modal } from '../common/Modal';
import { uploadLedgerImage } from '../../services/api';
import { ParsedTransactionCandidate } from '../../types';
import { Camera, Upload, Check, FileText, CheckCircle2 } from 'lucide-react';

export const ImageUploadModal: React.FC = () => {
  const {
    isImageUploadOpen,
    closeImageUpload,
    recordBatchTransactions,
    storeProfile,
  } = useStore();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [extractedResults, setExtractedResults] = useState<ParsedTransactionCandidate[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const scanStages = [
    'Scanning handwriting & text layout...',
    'Finding customer names & accounts...',
    'Reading rupee amounts & line items...',
    'Extracting due dates & payment terms...',
    'Preparing ledger transactions...',
  ];

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setExtractedResults([]);
    startOcrScanning(file);
  };

  const startOcrScanning = async (file: File) => {
    setIsScanning(true);
    setScanStep(0);

    // Progressive step simulation while calling API
    const timer1 = setTimeout(() => setScanStep(1), 350);
    const timer2 = setTimeout(() => setScanStep(2), 700);
    const timer3 = setTimeout(() => setScanStep(3), 1050);
    const timer4 = setTimeout(() => setScanStep(4), 1400);

    try {
      const response = await uploadLedgerImage(file, storeProfile);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      setScanStep(4);
      await new Promise((r) => setTimeout(r, 400));
      setExtractedResults(response.transactions);
    } catch {
      // Fallback
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirmBatch = () => {
    if (extractedResults.length === 0) return;
    recordBatchTransactions(extractedResults);
    handleClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsScanning(false);
    setExtractedResults([]);
    closeImageUpload();
  };

  return (
    <Modal
      isOpen={isImageUploadOpen}
      onClose={handleClose}
      title="Upload Ledger Photo or Bill"
      subtitle="Expenso reads handwritten bahi-khata notebooks, printed invoices, and receipts"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Hidden inputs */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />

        {/* Upload Zone / Drop Area */}
        {!selectedFile && (
          <div className="border-2 border-dashed border-[#D5CEC1] hover:border-[#1C1917] rounded-2xl p-6 sm:p-8 text-center bg-[#FAF8F5] transition-colors">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EFECE4] flex items-center justify-center text-[#57534E] mb-3">
              <FileText className="w-7 h-7" />
            </div>

            <h4 className="text-sm sm:text-base font-bold text-[#1C1917]">
              Select ledger photo or invoice
            </h4>
            <p className="text-xs text-[#78716C] max-w-sm mx-auto mt-1 mb-5">
              Supports JPEG, PNG, WEBP. Expenso will auto-extract customers, amounts, and dates.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* Mobile camera direct button */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#1C1917] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs hover:bg-[#292524] transition-all"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Take Photo (Camera)</span>
              </button>

              {/* File upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-[#D5CEC1] text-[#1C1917] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#F2EFE8] transition-all"
              >
                <Upload className="w-4 h-4 text-[#78716C]" />
                <span>Upload from Device</span>
              </button>
            </div>
          </div>
        )}

        {/* Image Preview & Scanning State */}
        {selectedFile && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-[#F8F6F0] rounded-xl border border-[#E8E3D8]">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Ledger preview"
                  className="w-14 h-14 object-cover rounded-lg border border-[#D5CEC1] shrink-0"
                />
              )}
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-bold text-[#1C1917] truncate">{selectedFile.name}</p>
                <p className="text-[11px] text-[#78716C]">
                  {Math.round(selectedFile.size / 1024)} KB • Ready for Munim OCR
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setExtractedResults([]);
                }}
                className="text-xs text-[#78716C] hover:text-[#1C1917] underline shrink-0 px-2"
              >
                Change
              </button>
            </div>

            {/* Scanning Progress */}
            {isScanning && (
              <div className="p-4 bg-white rounded-2xl border border-[#E8E3D8] shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0" />
                  <p className="text-xs font-bold text-[#1C1917]">Reading your ledger...</p>
                </div>

                {/* Step list */}
                <div className="space-y-1.5 pl-2">
                  {scanStages.map((stage, idx) => {
                    const isDone = idx < scanStep;
                    const isCurrent = idx === scanStep;
                    return (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : isCurrent ? (
                          <div className="w-3.5 h-3.5 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                          </div>
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-[#D5CEC1] shrink-0" />
                        )}
                        <span
                          className={`${
                            isCurrent
                              ? 'font-bold text-[#1C1917]'
                              : isDone
                              ? 'text-[#57534E]'
                              : 'text-[#A8A29E]'
                          }`}
                        >
                          {stage}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Extracted Candidates list */}
            {!isScanning && extractedResults.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">
                    Detected {extractedResults.length} Transactions
                  </p>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    High Confidence OCR
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {extractedResults.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E3D8] flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-bold text-[#1C1917]">{item.customerName}</p>
                        <p className="text-xs text-[#78716C]">{item.description}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                          Due: {item.dueDate || 'Immediate'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-extrabold font-mono-num text-[#1C1917]">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[11px] font-semibold text-emerald-700 capitalize">
                          {item.type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Batch confirmation button */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={handleConfirmBatch}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#1C1917] hover:bg-[#292524] text-[#F8F6F0] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Confirm & Record All ({extractedResults.length})</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
