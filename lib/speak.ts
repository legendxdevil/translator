export interface SpeakOptions {
  pitch?: number;
  rate?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

let speechRequestId = 0;

/**
 * Get available browser voices for speech synthesis
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  return window.speechSynthesis.getVoices();
}

function getVoiceForLanguage(
  voices: SpeechSynthesisVoice[],
  language: string
): SpeechSynthesisVoice | undefined {
  const normalizedLanguage = language.toLowerCase();
  const languagePrefix = normalizedLanguage.split('-')[0];

  return (
    voices.find((voice) => voice.lang.toLowerCase() === normalizedLanguage) ||
    voices.find((voice) => voice.lang.toLowerCase().split('-')[0] === languagePrefix)
  );
}

function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve([]);
  }

  const synthesis = window.speechSynthesis;
  const voices = synthesis.getVoices();
  if (voices.length > 0) {
    return Promise.resolve(voices);
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      synthesis.removeEventListener('voiceschanged', finish);
      resolve(synthesis.getVoices());
    };

    synthesis.addEventListener('voiceschanged', finish, { once: true });
    window.setTimeout(finish, 1500);
  });
}

/** Speak text using a voice that matches the requested language. */
export function speakText(
  text: string,
  lang: string,
  options: SpeakOptions = {}
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Web Speech API is not supported in this browser.');
    options.onError?.(new Error('Web Speech API not supported'));
    return null;
  }

  // Stop any active speech before starting new speech
  window.speechSynthesis.cancel();

  const cleanText = text.trim();
  if (!cleanText) return null;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = lang;
  utterance.pitch = options.pitch ?? 1.0;
  utterance.rate = options.rate ?? 0.95; // Slightly natural pace
  utterance.volume = options.volume ?? 1.0;

  utterance.onstart = () => {
    options.onStart?.();
  };

  utterance.onend = () => {
    options.onEnd?.();
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    options.onEnd?.();
    options.onError?.(e);
  };

  const synthesis = window.speechSynthesis;
  const requestId = ++speechRequestId;
  void waitForVoices().then((voices) => {
    if (requestId !== speechRequestId) return;

    const matchingVoice = getVoiceForLanguage(voices, lang);
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    synthesis.speak(utterance);
  });

  return utterance;
}

/**
 * Stop currently active speech synthesis
 */
export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    speechRequestId += 1;
    window.speechSynthesis.cancel();
  }
}
