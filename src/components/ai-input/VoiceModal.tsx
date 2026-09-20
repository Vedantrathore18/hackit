import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { BottomSheet } from '../common/BottomSheet';
import { VoiceListener, isSpeechRecognitionSupported } from '../../services/speechRecognition';
import { parseNaturalLanguageInput } from '../../services/nlpParser';
import { Mic, MicOff, Check, Edit2, Volume2, Globe } from 'lucide-react';
import { ParsedTransactionCandidate } from '../../types';

export const VoiceModal: React.FC = () => {
  const { isVoiceModalOpen, closeVoiceModal, setCandidateForConfirmation } = useStore();

  const [language, setLanguage] = useState<'hi-IN' | 'en-IN'>('hi-IN');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<ParsedTransactionCandidate | null>(null);

  const voiceListenerRef = useRef<VoiceListener | null>(null);
  const isSupported = isSpeechRecognitionSupported();

  // Reset states when opened
  useEffect(() => {
    if (isVoiceModalOpen) {
      setTranscript('');
      setErrorMessage(null);
      setParsedPreview(null);

      if (isSupported) {
        startListeningSession();
      } else {
        setErrorMessage('Speech recognition is not supported in this browser. Try our simulated voice demos below or type directly.');
      }
    } else {
      stopListeningSession();
    }
    return () => {
      stopListeningSession();
    };
  }, [isVoiceModalOpen, language]);

  const startListeningSession = () => {
    try {
      setErrorMessage(null);
      setIsListening(true);
      voiceListenerRef.current = new VoiceListener(
        (interim) => {
          setTranscript(interim);
        },
        (final) => {
          setTranscript(final);
          const parsed = parseNaturalLanguageInput(final);
          setParsedPreview(parsed);
          setIsListening(false);
        },
        (err) => {
          console.warn('Voice error:', err);
          setIsListening(false);
          if (err === 'not-allowed') {
            setErrorMessage('Microphone access was denied. Please allow microphone permissions or use quick presets.');
          } else {
            setErrorMessage(`Microphone status: ${err}. You can also use quick voice samples below.`);
          }
        },
        () => {
          setIsListening(false);
        },
        language
      );
      voiceListenerRef.current.start();
    } catch {
      setIsListening(false);
    }
  };

  const stopListeningSession = () => {
    setIsListening(false);
    if (voiceListenerRef.current) {
      voiceListenerRef.current.stop();
      voiceListenerRef.current = null;
    }
  };

  // Preset voice simulations for hackathon judges
  const presetPhrases = [
    'Sharma ji ne 2400 rupaye ka saman liya hai, 7 din baad denge',
    'Ramesh ne 1500 online payment kar diya',
    'Paid supplier Gupta provisions 12000 cash',
    'Amit bhai ne 800 rupaye ka saman udhaar liya kal denge',
  ];

  const handleSimulateVoice = (phrase: string) => {
    stopListeningSession();
    setTranscript(phrase);
    setErrorMessage(null);
    const parsed = parseNaturalLanguageInput(phrase);
    setParsedPreview(parsed);
  };

  const handleConfirm = () => {
    if (!parsedPreview) return;
    setCandidateForConfirmation(parsedPreview, 'voice', transcript);
    closeVoiceModal();
  };

  return (
    <BottomSheet
      isOpen={isVoiceModalOpen}
      onClose={closeVoiceModal}
      title={
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-bold text-base text-[#1C1917]">Voice Transaction Munim</span>
        </div>
      }
      subtitle="Speak naturally in Hindi, Hinglish, or English"
    >
      <div className="space-y-5">
        {/* Language selector */}
        <div className="flex items-center justify-between bg-[#F8F6F0] p-2 rounded-xl border border-[#E8E3D8]">
          <div className="flex items-center gap-1.5 text-xs text-[#57534E] font-medium pl-1">
            <Globe className="w-3.5 h-3.5" />
            <span>Spoken Language:</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setLanguage('hi-IN')}
              className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors ${
                language === 'hi-IN'
                  ? 'bg-[#1C1917] text-white shadow-2xs'
                  : 'bg-white text-[#57534E] hover:bg-[#EFECE4]'
              }`}
            >
              Hindi / Hinglish
            </button>
            <button
              onClick={() => setLanguage('en-IN')}
              className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors ${
                language === 'en-IN'
                  ? 'bg-[#1C1917] text-white shadow-2xs'
                  : 'bg-white text-[#57534E] hover:bg-[#EFECE4]'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Listening Waveform Area */}
        <div className="py-6 px-4 bg-[#F8F6F0] rounded-2xl border border-[#E2DDD2] flex flex-col items-center justify-center text-center relative overflow-hidden">
          {isListening ? (
            <div className="flex flex-col items-center">
              {/* Waveform bars */}
              <div className="flex items-center gap-1.5 h-12 mb-4">
                <div className="w-1.5 bg-emerald-600 rounded-full animate-wave-1" />
                <div className="w-1.5 bg-emerald-600 rounded-full animate-wave-2" />
                <div className="w-1.5 bg-emerald-600 rounded-full animate-wave-3" />
                <div className="w-1.5 bg-emerald-600 rounded-full animate-wave-4" />
                <div className="w-1.5 bg-emerald-600 rounded-full animate-wave-5" />
                <div className="w-1.5 bg-emerald-600 rounded-full animate-wave-2" />
                <div className="w-1.5 bg-emerald-600 rounded-full animate-wave-1" />
              </div>
              <p className="text-sm font-bold text-[#1C1917]">Listening...</p>
              <p className="text-xs text-[#78716C] mt-1">
                Say customer name, amount, and due date
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <button
                onClick={startListeningSession}
                className="w-16 h-16 rounded-full bg-[#1C1917] hover:bg-[#292524] text-white flex items-center justify-center shadow-md active:scale-95 transition-all mb-3"
              >
                <Mic className="w-7 h-7 text-emerald-400" />
              </button>
              <p className="text-xs font-semibold text-[#57534E]">Tap to speak</p>
            </div>
          )}

          {/* Real-time transcript box */}
          {transcript && (
            <div className="mt-4 p-3 w-full bg-white rounded-xl border border-[#D5CEC1] text-left">
              <p className="text-[11px] font-bold uppercase text-[#78716C]">Heard Voice:</p>
              <p className="text-sm font-medium text-[#1C1917] mt-0.5 italic">"{transcript}"</p>
            </div>
          )}

          {errorMessage && (
            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-1.5 text-left">
              <MicOff className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Structured Transaction Preview Card */}
        {parsedPreview && (
          <div className="p-4 bg-white rounded-2xl border-2 border-emerald-600 shadow-sm animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2EFE8]">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                  Expenso Understood
                </span>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                {Math.round(parsedPreview.confidence * 100)}% Match
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <p className="text-[11px] text-[#78716C]">Customer</p>
                <p className="text-sm font-bold text-[#1C1917]">{parsedPreview.customerName}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#78716C]">Amount</p>
                <p className="text-base font-extrabold font-mono-num text-[#1C1917]">
                  ₹{parsedPreview.amount.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#78716C]">Type</p>
                <p className="text-xs font-bold capitalize text-[#57534E]">
                  {parsedPreview.type.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#78716C]">Due Date</p>
                <p className="text-xs font-bold text-amber-800">
                  {parsedPreview.dueDate || 'Immediate settlement'}
                </p>
              </div>
            </div>

            {/* Impact statement */}
            <div className="mt-3 p-2 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[11px] text-[#15803D] font-medium">
              💡 {parsedPreview.cashFlowImpact}
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 px-4 bg-[#1C1917] hover:bg-[#292524] text-[#F8F6F0] rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Record</span>
              </button>
              <button
                onClick={() => {
                  setParsedPreview(null);
                  startListeningSession();
                }}
                className="py-2.5 px-3 bg-[#F2EFE8] hover:bg-[#E5E0D4] text-[#1C1917] rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
            </div>
          </div>
        )}

        {/* Preset Voice Demo Chips for Hackathon Judges */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Volume2 className="w-3.5 h-3.5 text-[#78716C]" />
            <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
              1-Tap Voice Demos (For judging & testing)
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {presetPhrases.map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => handleSimulateVoice(phrase)}
                className="text-left p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F2EFE8] border border-[#E8E3D8] hover:border-[#D5CEC1] text-xs text-[#57534E] font-medium transition-colors"
              >
                "{phrase}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};
