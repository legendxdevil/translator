export interface SpeakOptions {
  pitch?: number;
  rate?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

/**
 * Get available browser voices for speech synthesis
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  return window.speechSynthesis.getVoices();
}

/**
 * Speak text in specified language ('hi-IN' | 'en-US') with native voice selection
 */
export function speakText(
  text: string,
  lang: 'hi-IN' | 'en-US',
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

  const voices = window.speechSynthesis.getVoices();
  const langPrefix = lang.split('-')[0].toLowerCase(); // 'hi' or 'en'
  
  // Find exact voice match (e.g. hi-IN or en-US), or matching language prefix, or voice name
  const matchingVoice = 
    voices.find(v => v.lang.toLowerCase() === lang.toLowerCase()) ||
    voices.find(v => v.lang.toLowerCase().startsWith(langPrefix)) ||
    voices.find(v => v.name.toLowerCase().includes(langPrefix === 'hi' ? 'hindi' : 'english')) ||
    voices.find(v => v.lang.includes(langPrefix.toUpperCase()));

  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

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

  window.speechSynthesis.speak(utterance);
  return utterance;
}

/**
 * Stop currently active speech synthesis
 */
export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
