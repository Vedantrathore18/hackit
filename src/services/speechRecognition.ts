// Web Speech API interface for Indian multilingual voice capture (Hindi/Hinglish/English)

// Extend Window interface for Web Speech API
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export class VoiceListener {
  private recognition: SpeechRecognitionLike | null = null;
  private isListening: boolean = false;
  private onInterimText: (text: string) => void;
  private onFinalText: (text: string) => void;
  private onError: (error: string) => void;
  private onEnd: () => void;
  private lang: 'hi-IN' | 'en-IN' | 'en-US';

  constructor(
    onInterimText: (text: string) => void,
    onFinalText: (text: string) => void,
    onError: (error: string) => void,
    onEnd: () => void,
    lang: 'hi-IN' | 'en-IN' | 'en-US' = 'hi-IN'
  ) {
    this.onInterimText = onInterimText;
    this.onFinalText = onFinalText;
    this.onError = onError;
    this.onEnd = onEnd;
    this.lang = lang;
    this.init();
  }

  private init() {
    if (!isSpeechRecognitionSupported()) return;

    const win = window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };

    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRec) return;

    this.recognition = new SpeechRec();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = this.lang;

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (interim) {
        this.onInterimText(interim);
      }
      if (final) {
        this.onFinalText(final);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      this.isListening = false;
      this.onError(event.error || 'Speech recognition error');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onEnd();
    };
  }

  public setLanguage(lang: 'hi-IN' | 'en-IN' | 'en-US') {
    this.lang = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public start() {
    if (!this.recognition) {
      this.onError('Speech recognition is not supported in this browser');
      return;
    }
    try {
      this.recognition.start();
    } catch {
      // If already started or aborting
      try {
        this.recognition.stop();
        setTimeout(() => this.recognition?.start(), 150);
      } catch {
        // Ignore
      }
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore
      }
    }
  }
}
