import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Check, X, Sparkles, Volume2, Play, Square, AlertCircle, RefreshCw } from 'lucide-react';
import { parseVoiceTransaction, DEMO_SCENARIOS } from '../utils/voiceParser';

export default function VoiceTransactionModal({
  isOpen,
  onClose,
  onSaveTransaction,
  customers = [],
  initialText = ""
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState(initialText || "");
  const [parsedData, setParsedData] = useState(null);
  const [micLanguage, setMicLanguage] = useState('hi-IN'); // hi-IN or en-IN
  const [hasMicPermission, setHasMicPermission] = useState(null); // null, true, false
  const [errorMessage, setErrorMessage] = useState("");

  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (initialText) {
      setTranscript(initialText);
      const parsed = parseVoiceTransaction(initialText, customers);
      setParsedData(parsed);
    }
  }, [initialText, customers]);

  // Clean up audio & visualizer when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopAllAudio();
    }
  }, [isOpen]);

  const stopAllAudio = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  // Real-time Audio Visualizer
  const startAudioVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setHasMicPermission(true);
      setErrorMessage("");

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          const r = 16;
          const g = Math.min(255, 185 + dataArray[i] / 3);
          const b = 129;

          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.beginPath();
          ctx.roundRect(x, canvas.height - barHeight, barWidth - 2, barHeight, [3, 3, 0, 0]);
          ctx.fill();

          x += barWidth;
        }
      };

      draw();
    } catch (err) {
      console.warn("Microphone access notice:", err);
      setHasMicPermission(false);
      setErrorMessage("Microphone permission needed to record live voice. You can still type or click scenarios!");
    }
  };

  // Start Speech Recognition
  const startListening = async () => {
    setErrorMessage("");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage("Browser does not support Speech Recognition. Please use Chrome/Edge or click preset scenarios.");
      return;
    }

    try {
      await startAudioVisualizer();

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = micLanguage;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        const parsed = parseVoiceTransaction(currentTranscript, customers);
        setParsedData(parsed);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage("Microphone permission was denied. Please allow microphone access in your browser address bar.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error(e);
      setErrorMessage(e.message || "Failed to start microphone.");
    }
  };

  const stopListening = () => {
    stopAllAudio();
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setTranscript(val);
    const parsed = parseVoiceTransaction(val, customers);
    setParsedData(parsed);
  };

  const handleApplyScenario = (scenario) => {
    setTranscript(scenario.phrase);
    const parsed = parseVoiceTransaction(scenario.phrase, customers);
    setParsedData(parsed);
  };

  const handleConfirm = () => {
    if (!parsedData || !parsedData.amount) {
      alert("Please specify or speak an amount");
      return;
    }
    stopAllAudio();
    onSaveTransaction(parsedData);
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
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
        position: 'relative',
        maxHeight: '92vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mic size={20} color="var(--emerald-text)" /> Voice Financial Assistant
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Speak naturally in Hindi, Hinglish, or English
            </span>
          </div>
          <button
            onClick={() => {
              stopAllAudio();
              onClose();
            }}
            style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Language Selection */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => setMicLanguage('hi-IN')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '600',
              background: micLanguage === 'hi-IN' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: micLanguage === 'hi-IN' ? '#34d399' : '#94a3b8',
              border: micLanguage === 'hi-IN' ? '1px solid #10b981' : '1px solid transparent'
            }}
          >
            🇮🇳 Hindi / Hinglish ("शर्मा जी ₹2,400 उधार...")
          </button>
          <button
            onClick={() => setMicLanguage('en-IN')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '600',
              background: micLanguage === 'en-IN' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: micLanguage === 'en-IN' ? '#34d399' : '#94a3b8',
              border: micLanguage === 'en-IN' ? '1px solid #10b981' : '1px solid transparent'
            }}
          >
            🌐 English
          </button>
        </div>

        {/* Real-time Audio Waveform Canvas */}
        <div style={{
          background: '#070a12',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <canvas
            ref={canvasRef}
            width={320}
            height={48}
            style={{
              width: '100%',
              maxWidth: '320px',
              height: '48px',
              marginBottom: '14px',
              display: isListening ? 'block' : 'none'
            }}
          />

          {!isListening && (
            <div style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.82rem' }}>
              Tap microphone to activate real-time voice recognition
            </div>
          )}

          {/* Big Mic Button */}
          <button
            onClick={isListening ? stopListening : startListening}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: isListening
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isListening 
                ? '0 0 35px rgba(239, 68, 68, 0.7)' 
                : '0 0 30px rgba(16, 185, 129, 0.45)',
              transform: isListening ? 'scale(1.08)' : 'scale(1)',
              transition: 'all 0.25s ease'
            }}
          >
            {isListening ? <Square size={32} /> : <Mic size={36} />}
          </button>

          <span style={{ marginTop: '12px', fontSize: '0.85rem', fontWeight: '700', color: isListening ? '#f87171' : '#34d399' }}>
            {isListening ? "🔴 Recording Live Voice... Speak now!" : "Click to Speak"}
          </span>
        </div>

        {/* Error notice if any */}
        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '10px 12px',
            marginBottom: '14px',
            fontSize: '0.78rem',
            color: '#fca5a5',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Editable Transcript Textarea */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
            Spoken Voice Transcript (or Type Manual Entry):
          </label>
          <textarea
            value={transcript}
            onChange={handleTextChange}
            placeholder="e.g. Sharma ji took ₹2,400 worth of groceries on 7 days credit..."
            rows={2}
            style={{
              width: '100%',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              color: '#f8fafc',
              padding: '10px 14px',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none'
            }}
          />
        </div>

        {/* Quick Test Scenarios */}
        <div style={{ marginBottom: '18px' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '6px' }}>
            Quick Hackathon Scenarios:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {DEMO_SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                onClick={() => handleApplyScenario(sc)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '5px 10px',
                  fontSize: '0.72rem',
                  color: '#d1fae5'
                }}
              >
                "{sc.label}"
              </button>
            ))}
          </div>
        </div>

        {/* Structured AI Extraction Preview */}
        {parsedData && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} /> STRUCTURED LEDGER EXTRACTION
              </span>
              <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
                {Math.round(parsedData.confidence * 100)}% Match
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '0.88rem' }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block' }}>Customer / Party</span>
                <strong style={{ color: '#f8fafc' }}>{parsedData.customerName}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block' }}>Transaction Amount</span>
                <strong style={{ color: '#34d399', fontSize: '1.2rem' }}>₹{parsedData.amount?.toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block' }}>Transaction Type</span>
                <span className={`badge ${parsedData.type === 'credit_sale' ? 'badge-amber' : parsedData.type === 'payment_received' ? 'badge-emerald' : 'badge-blue'}`}>
                  {parsedData.type.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block' }}>Payment Term / Due Date</span>
                <strong style={{ color: '#f59e0b' }}>
                  {parsedData.type === 'credit_sale' ? `${parsedData.dueDate} (${parsedData.dueDays}d)` : 'Immediate'}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleConfirm}
          disabled={!parsedData}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '0.95rem',
            opacity: parsedData ? 1 : 0.5,
            cursor: parsedData ? 'pointer' : 'not-allowed'
          }}
        >
          <Check size={20} /> Save & Record to Ledger
        </button>
      </div>
    </div>
  );
}
