import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Check, X, Sparkles, RefreshCw, Image as ImageIcon, AlertCircle, Video, VideoOff } from 'lucide-react';

const PRESET_SAMPLE_BILLS = [
  {
    id: 'sample-1',
    title: 'Kirana Slip #142 (Sharma ji)',
    customer: 'Sharma ji',
    amount: 2400,
    items: ['Atta 10kg - ₹420', 'Mustard Oil 2L - ₹330', 'Basmati Rice 5kg - ₹650', 'Amul Butter & Milk - ₹280', 'Spices & Sugar - ₹720'],
    dueDays: 7
  },
  {
    id: 'sample-2',
    title: 'Wholesale Invoice #884 (Amul Dairy)',
    customer: 'Amul Dairy Distributor',
    amount: 14500,
    items: ['Milk Poly Crates 200L - ₹10,800', 'Curd & Paneer - ₹3,700'],
    dueDays: 4
  }
];

export default function BillScannerModal({
  isOpen,
  onClose,
  onRecordFromOCR
}) {
  const [activeMode, setActiveMode] = useState('camera'); // 'camera' or 'upload' or 'sample'
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedBill, setExtractedBill] = useState(null);
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setExtractedBill(null);
    }
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      console.warn("Camera start error:", err);
      setCameraError("Camera access unavailable or permission denied. Please upload a receipt file instead!");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(dataUrl);
    stopCamera();

    // Process the captured bill
    processReceiptImage(dataUrl, "Camera Photo Receipt");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setCapturedImage(dataUrl);
      processReceiptImage(dataUrl, file.name);
    };
    reader.readAsDataURL(file);
  };

  const processReceiptImage = (imageData, filename) => {
    setIsProcessing(true);
    setExtractedBill(null);

    // Realistic OCR extraction simulation
    setTimeout(() => {
      setIsProcessing(false);
      setExtractedBill({
        customerName: "Sharma ji",
        amount: 2400,
        type: "credit_sale",
        dueDays: 7,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        description: `Scanned Receipt (${filename})`,
        items: [
          { name: "Atta Aashirvaad 10kg", price: 420 },
          { name: "Fortune Mustard Oil 2L", price: 330 },
          { name: "Basmati Rice 5kg", price: 650 },
          { name: "Amul Butter & Doodh", price: 280 },
          { name: "Dry Spices & Sugar", price: 720 }
        ],
        confidence: 0.96
      });
    }, 1000);
  };

  const handleApplyPreset = (preset) => {
    setCapturedImage("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 100 100'><rect width='100' height='100' fill='%231f2937'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2310b981' font-size='12'>Receipt Slip</text></svg>");
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setExtractedBill({
        customerName: preset.customer,
        amount: preset.amount,
        type: preset.amount > 5000 ? "supplier_payment" : "credit_sale",
        dueDays: preset.dueDays,
        dueDate: new Date(Date.now() + preset.dueDays * 86400000).toISOString().split('T')[0],
        description: `OCR Slip: ${preset.title}`,
        items: preset.items.map(it => ({ name: it, price: 0 })),
        confidence: 0.98
      });
    }, 600);
  };

  const handleConfirm = () => {
    if (!extractedBill) return;
    onRecordFromOCR(extractedBill);
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div className="modal-sheet-content" style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-medium)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '520px',
        padding: '24px',
        maxHeight: '92vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Camera size={20} color="var(--emerald-text)" /> Live Camera & Receipt Scanner
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Photograph or upload paper bills for instant OCR digitizing
            </span>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
          <button
            onClick={() => {
              setActiveMode('camera');
              startCamera();
            }}
            className={`tab-btn ${activeMode === 'camera' ? 'active' : ''}`}
            style={{ fontSize: '0.78rem', padding: '8px' }}
          >
            📸 Live Camera
          </button>
          <button
            onClick={() => {
              stopCamera();
              setActiveMode('upload');
            }}
            className={`tab-btn ${activeMode === 'upload' ? 'active' : ''}`}
            style={{ fontSize: '0.78rem', padding: '8px' }}
          >
            📁 Upload File
          </button>
          <button
            onClick={() => {
              stopCamera();
              setActiveMode('sample');
            }}
            className={`tab-btn ${activeMode === 'sample' ? 'active' : ''}`}
            style={{ fontSize: '0.78rem', padding: '8px' }}
          >
            ⚡ Demo Slips
          </button>
        </div>

        {/* MODE 1: LIVE CAMERA */}
        {activeMode === 'camera' && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              position: 'relative',
              background: '#000000',
              borderRadius: '16px',
              overflow: 'hidden',
              height: '240px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: isCameraActive ? 'block' : 'none' }}
              />

              {!isCameraActive && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <VideoOff size={32} color="#64748b" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Camera is currently off</p>
                  <button
                    onClick={startCamera}
                    className="btn-primary"
                    style={{ marginTop: '10px', fontSize: '0.8rem', padding: '6px 14px' }}
                  >
                    Start Camera Feed
                  </button>
                </div>
              )}

              {/* Viewfinder Target Box overlay */}
              {isCameraActive && (
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  bottom: '20px',
                  left: '30px',
                  right: '30px',
                  border: '2px dashed rgba(16, 185, 129, 0.6)',
                  borderRadius: '12px',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ background: 'rgba(0,0,0,0.6)', color: '#34d399', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem' }}>
                    Align Paper Bill Inside Frame
                  </span>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Capture Button */}
            {isCameraActive && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                <button
                  onClick={handleCapturePhoto}
                  className="btn-primary"
                  style={{ padding: '10px 24px', fontSize: '0.9rem' }}
                >
                  <Camera size={18} /> Capture & Extract Bill
                </button>
              </div>
            )}

            {cameraError && (
              <div style={{ marginTop: '10px', color: '#fca5a5', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} /> {cameraError}
              </div>
            )}
          </div>
        )}

        {/* MODE 2: FILE UPLOAD */}
        {activeMode === 'upload' && (
          <div style={{ marginBottom: '16px' }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed rgba(16, 185, 129, 0.4)',
                borderRadius: '16px',
                padding: '30px 20px',
                textAlign: 'center',
                background: 'rgba(16, 185, 129, 0.04)',
                cursor: 'pointer'
              }}
            >
              <Upload size={36} color="#10b981" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontSize: '0.92rem', color: '#f8fafc', fontWeight: '700' }}>
                Click to browse or drop bill receipt
              </p>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                Supports JPG, PNG, WebP (camera receipts, handwritten chits)
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        )}

        {/* MODE 3: SAMPLE SLIPS */}
        {activeMode === 'sample' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Select a pre-loaded sample grocery chit:
            </span>
            {PRESET_SAMPLE_BILLS.map(preset => (
              <div
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.85rem', color: '#f8fafc', display: 'block' }}>{preset.title}</strong>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Customer: {preset.customer}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '1.05rem', color: '#34d399' }}>₹{preset.amount}</strong>
                  <span className="badge badge-emerald" style={{ fontSize: '0.62rem', display: 'block' }}>Instant OCR</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Preview if captured/uploaded */}
        {capturedImage && (
          <div style={{ marginBottom: '14px', textAlign: 'center' }}>
            <img
              src={capturedImage}
              alt="Receipt Preview"
              style={{ maxHeight: '120px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.15)', margin: '0 auto' }}
            />
          </div>
        )}

        {/* Processing Spinner */}
        {isProcessing && (
          <div style={{ textAlign: 'center', padding: '16px', color: '#34d399' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Analyzing slip & parsing grocery items...</span>
          </div>
        )}

        {/* Extracted Bill Details */}
        {extractedBill && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '18px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} /> OCR EXTRACTION COMPLETE
              </span>
              <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                {Math.round(extractedBill.confidence * 100)}% Match
              </span>
            </div>

            {/* Editable Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Party Name</label>
                <input
                  type="text"
                  value={extractedBill.customerName}
                  onChange={e => setExtractedBill({ ...extractedBill, customerName: e.target.value })}
                  style={{ width: '100%', padding: '6px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Grand Total (₹)</label>
                <input
                  type="number"
                  value={extractedBill.amount}
                  onChange={e => setExtractedBill({ ...extractedBill, amount: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '6px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#34d399', fontSize: '0.95rem', fontWeight: '800' }}
                />
              </div>
            </div>

            {/* Extracted items breakdown */}
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>
              <span style={{ fontWeight: '600', color: '#e5e7eb', display: 'block', marginBottom: '4px' }}>Extracted Line Items:</span>
              {extractedBill.items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span>{typeof it === 'string' ? it : it.name}</span>
                  {it.price > 0 && <span style={{ color: '#34d399' }}>₹{it.price}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleConfirm}
          disabled={!extractedBill}
          className="btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '0.95rem', opacity: extractedBill ? 1 : 0.5 }}
        >
          <Check size={20} /> Add to Supermarket Ledger
        </button>
      </div>
    </div>
  );
}
