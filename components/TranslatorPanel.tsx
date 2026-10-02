'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Mic,
  MicOff,
  History,
  Languages,
  Sliders,
  X,
  AlertCircle
} from 'lucide-react';
import { speakText, stopSpeech } from '@/lib/speak';
import { detectScript } from '@/lib/detectScript';

interface HistoryItem {
  id: string;
  input: string;
  hindi: string;
  english: string;
  detectedScript: string;
  timestamp: string;
}

const LANGUAGE_OPTIONS = [
  { code: 'auto', label: 'Auto-detect', locale: 'en-US' },
  { code: 'en', label: 'English', locale: 'en-US' },
  { code: 'hi', label: 'Hindi', locale: 'hi-IN' },
  { code: 'es', label: 'Spanish', locale: 'es-ES' },
  { code: 'fr', label: 'French', locale: 'fr-FR' },
  { code: 'de', label: 'German', locale: 'de-DE' },
  { code: 'bn', label: 'Bengali', locale: 'bn-IN' },
  { code: 'mr', label: 'Marathi', locale: 'mr-IN' },
  { code: 'ta', label: 'Tamil', locale: 'ta-IN' },
  { code: 'te', label: 'Telugu', locale: 'te-IN' },
  { code: 'pa', label: 'Punjabi', locale: 'pa-IN' },
  { code: 'ar', label: 'Arabic', locale: 'ar-SA' },
  { code: 'ja', label: 'Japanese', locale: 'ja-JP' },
  { code: 'ko', label: 'Korean', locale: 'ko-KR' },
  { code: 'zh-CN', label: 'Chinese', locale: 'zh-CN' },
  { code: 'ru', label: 'Russian', locale: 'ru-RU' },
  { code: 'pt', label: 'Portuguese', locale: 'pt-PT' },
  { code: 'it', label: 'Italian', locale: 'it-IT' },
  { code: 'ur', label: 'Urdu', locale: 'ur-PK' },
  { code: 'gu', label: 'Gujarati', locale: 'gu-IN' },
  { code: 'kn', label: 'Kannada', locale: 'kn-IN' },
  { code: 'ml', label: 'Malayalam', locale: 'ml-IN' },
];

const SAMPLE_PRESETS = [
  { label: 'aap kaise ho', text: 'aap kaise ho' },
  { label: 'aaj mausam bahut accha hai', text: 'aaj mausam bahut accha hai' },
  { label: 'mujhe khana khana hai', text: 'mujhe khana khana hai' },
  { label: 'namaste dosto', text: 'namaste dosto' },
  { label: 'aap kahaan jaa rahe ho', text: 'aap kahaan jaa rahe ho' },
];

export function TranslatorPanel() {
  const [input, setInput] = useState('');
  const [hindiOutput, setHindiOutput] = useState('');
  const [englishOutput, setEnglishOutput] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [detectedScript, setDetectedScript] = useState<'hinglish' | 'hindi' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TTS State
  const [speakingTarget, setSpeakingTarget] = useState<'hindi' | 'translation' | null>(null);
  const [ttsRate, setTtsRate] = useState(0.95);
  const [ttsPitch, setTtsPitch] = useState(1.0);
  const [showTtsSettings, setShowTtsSettings] = useState(false);

  // Copy state
  const [copiedTarget, setCopiedTarget] = useState<'hindi' | 'english' | null>(null);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Live script detection and real-time debounced translation on typing
  useEffect(() => {
    if (!input.trim()) {
      setDetectedScript(null);
      setHindiOutput('');
      setEnglishOutput('');
      return;
    }
    const script = detectScript(input);
    setDetectedScript(script === 'devanagari' ? 'hindi' : 'hinglish');

    const timer = setTimeout(() => {
      handleTranslate(input);
    }, 400);

    return () => clearTimeout(timer);
  }, [input, sourceLanguage, targetLanguage]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aura_translate_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [newItem, ...history.slice(0, 9)];
    setHistory(updated);
    try {
      localStorage.setItem('aura_translate_history', JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  // Perform Translation
  const handleTranslate = async (textToTranslate?: string) => {
    const queryText = (textToTranslate ?? input).trim();
    if (!queryText) {
      setError('Please enter Hindi or Hinglish text.');
      return;
    }

    setIsLoading(true);
    setError(null);
    stopSpeech();
    setSpeakingTarget(null);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: queryText, sourceLanguage, targetLanguage }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Translation failed');
      }

      setHindiOutput(data.source || data.hindi);
      setEnglishOutput(data.translation || data.english);
      setDetectedScript(data.detectedScript || 'hinglish');

      saveToHistory({
        input: queryText,
        hindi: data.hindi,
        english: data.english,
        detectedScript: data.detectedScript || 'hinglish'
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Dual Speaker Handler
  const handleSpeak = (target: 'hindi' | 'translation') => {
    if (speakingTarget === target) {
      stopSpeech();
      setSpeakingTarget(null);
      return;
    }

    const textToSpeak = target === 'hindi' ? hindiOutput : englishOutput;
    const sourceLocale = sourceLanguage === 'hi' || (sourceLanguage === 'auto' && detectedScript === 'hindi')
      ? 'hi-IN'
      : LANGUAGE_OPTIONS.find((language) => language.code === sourceLanguage)?.locale ?? navigator.language;
    const lang = target === 'hindi'
      ? sourceLocale
      : LANGUAGE_OPTIONS.find((language) => language.code === targetLanguage)?.locale ?? 'en-US';

    if (!textToSpeak) return;

    setSpeakingTarget(target);

    speakText(textToSpeak, lang, {
      rate: ttsRate,
      pitch: ttsPitch,
      onStart: () => setSpeakingTarget(target),
      onEnd: () => setSpeakingTarget(null),
      onError: () => setSpeakingTarget(null),
    });
  };

  // Copy to clipboard
  const handleCopy = (target: 'hindi' | 'english') => {
    const textToCopy = target === 'hindi' ? hindiOutput : englishOutput;
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy);
    setCopiedTarget(target);
    setTimeout(() => setCopiedTarget(null), 2000);
  };

  // Mic Speech Recognition
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    // Check Speech Recognition support
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Voice recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = sourceLanguage === 'auto'
        ? navigator.language || 'en-US'
        : LANGUAGE_OPTIONS.find((language) => language.code === sourceLanguage)?.locale ?? 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          handleTranslate(transcript);
        }
      };

      recognition.onerror = (event: { error?: string }) => {
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setError('Microphone permission is blocked. Allow microphone access and try again.');
        } else if (event.error !== 'aborted') {
          setError('Voice input failed. Please try again or type your text.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Main Glass Panel */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="liquid-glass-strong rounded-3xl p-6 md:p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden"
      >
        {/* Subtle Ambient Background Orbs inside card */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Input Header Toolbar */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
              <Languages className="w-3.5 h-3.5" />
              Any Language Input
            </span>

            {detectedScript && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${detectedScript === 'hindi'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                  }`}
              >
                Detected: {detectedScript === 'hindi' ? 'Hindi (Devanagari)' : 'Hinglish (Roman)'}
              </motion.span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 rounded-xl bg-purple-500/10 border border-purple-500/25 px-3 py-2 text-xs text-purple-200">
              <span className="hidden sm:inline">Translate from</span>
              <select
                value={sourceLanguage}
                onChange={(event) => setSourceLanguage(event.target.value)}
                className="bg-transparent text-white outline-none cursor-pointer"
                aria-label="Translate from language"
              >
                {LANGUAGE_OPTIONS.map((language) => (
                  <option key={language.code} value={language.code} className="bg-slate-900 text-white">
                    {language.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 rounded-xl bg-blue-500/10 border border-blue-500/25 px-3 py-2 text-xs text-blue-200">
              <Languages className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Translate to</span>
              <select
                value={targetLanguage}
                onChange={(event) => setTargetLanguage(event.target.value)}
                className="bg-transparent text-white outline-none cursor-pointer"
                aria-label="Translate to language"
              >
                {LANGUAGE_OPTIONS.map((language) => (
                  <option key={language.code} value={language.code} className="bg-slate-900 text-white">
                    {language.label}
                  </option>
                ))}
              </select>
            </label>

            {/* History Toggle */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5 border border-white/10"
              title="Translation History"
            >
              <History className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">History</span>
            </button>

            {/* TTS Settings Toggle */}
            <button
              onClick={() => setShowTtsSettings(!showTtsSettings)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5 border border-white/10"
              title="Voice Settings"
            >
              <Sliders className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Audio Settings</span>
            </button>
          </div>
        </div>

        {/* TTS Customization Bar */}
        <AnimatePresence>
          {showTtsSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-wrap items-center gap-6 text-xs text-slate-300"
            >
              <div className="flex items-center gap-3">
                <span>Speed: {ttsRate.toFixed(2)}x</span>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={ttsRate}
                  onChange={(e) => setTtsRate(parseFloat(e.target.value))}
                  className="accent-purple-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-3">
                <span>Pitch: {ttsPitch.toFixed(1)}</span>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={ttsPitch}
                  onChange={(e) => setTtsPitch(parseFloat(e.target.value))}
                  className="accent-blue-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
              <button
                onClick={() => {
                  setTtsRate(0.95);
                  setTtsPitch(1.0);
                }}
                className="ml-auto text-slate-400 hover:text-slate-200 underline text-[11px]"
              >
                Reset Default
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text Input Container */}
        <div className="relative mb-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleTranslate();
              }
            }}
            placeholder="Type text in any language..."
            rows={3}
            className="w-full bg-slate-950/60 text-white placeholder-slate-400 rounded-2xl p-4 pr-24 border border-white/15 focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all resize-none text-base md:text-lg leading-relaxed shadow-inner"
          />

          {/* Input Action Controls */}
          <div className="absolute right-3 bottom-4 flex items-center gap-2">
            {input && (
              <button
                onClick={() => {
                  setInput('');
                  setHindiOutput('');
                  setEnglishOutput('');
                  setDetectedScript(null);
                }}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                title="Clear Text"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Mic Speech Button */}
            <button
              onClick={toggleSpeechRecognition}
              className={`p-2.5 rounded-xl transition-all ${isListening
                ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
                }`}
              title={isListening ? 'Listening...' : 'Voice Input (Microphone)'}
            >
              {isListening ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleTranslate()}
            disabled={isLoading || !input.trim()}
            className={`w-full sm:w-auto px-8 py-3 rounded-2xl font-medium text-sm md:text-base flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${isLoading || !input.trim()
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
              : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border border-white/20 glass-glow-purple'
              }`}
          >
            {isLoading ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin text-purple-200" />
                <span>Translating...</span>
              </>
            ) : (
              <>
                <span>Translate</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-sm flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dual Outputs Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Output Card 1: Hindi (Devanagari) */}
          <div
            className={`rounded-2xl p-5 bg-slate-950/70 border transition-all relative overflow-hidden flex flex-col justify-between ${speakingTarget === 'hindi'
              ? 'border-purple-400/80 glass-glow-purple shadow-purple-900/30'
              : 'border-white/10 hover:border-white/20'
              }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  {LANGUAGE_OPTIONS.find((language) => language.code === sourceLanguage)?.label} Input
                </span>
                <span className="text-[11px] text-slate-500 font-mono">{LANGUAGE_OPTIONS.find((language) => language.code === sourceLanguage)?.locale}</span>
              </div>

              <div className="min-h-[90px] text-slate-100 font-sans text-lg md:text-xl leading-relaxed py-2">
                {isLoading ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-5 bg-purple-500/20 rounded w-3/4" />
                    <div className="h-5 bg-purple-500/10 rounded w-1/2" />
                  </div>
                ) : (
                  hindiOutput || <span className="text-slate-600 italic text-base">Your original text will appear here...</span>
                )}
              </div>
            </div>

            {/* Bottom Card Actions */}
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/5">
              {/* Dual Speaker Button (Hindi) */}
              <button
                onClick={() => handleSpeak('hindi')}
                disabled={!hindiOutput || isLoading}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${speakingTarget === 'hindi'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40 ring-2 ring-purple-400'
                  : hindiOutput
                    ? 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 border border-purple-500/30'
                    : 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
                  }`}
                title="Listen to source text"
              >
                {speakingTarget === 'hindi' ? (
                  <>
                    <VolumeX className="w-4 h-4 text-white" />
                    <span>Stop</span>
                    <div className="flex items-end gap-0.5 ml-1 h-3">
                      <span className="w-1 bg-white rounded-full animate-audio-bar-1" />
                      <span className="w-1 bg-white rounded-full animate-audio-bar-2" />
                      <span className="w-1 bg-white rounded-full animate-audio-bar-3" />
                    </div>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Speak Source</span>
                  </>
                )}
              </button>

              {/* Copy Button */}
              <button
                onClick={() => handleCopy('hindi')}
                disabled={!hindiOutput || isLoading}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Copy Hindi Text"
              >
                {copiedTarget === 'hindi' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output Card 2: English */}
          <div
            className={`rounded-2xl p-5 bg-slate-950/70 border transition-all relative overflow-hidden flex flex-col justify-between ${speakingTarget === 'translation'
              ? 'border-blue-400/80 glass-glow-blue shadow-blue-900/30'
              : 'border-white/10 hover:border-white/20'
              }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  {LANGUAGE_OPTIONS.find((language) => language.code === targetLanguage)?.label} Translation
                </span>
                <span className="text-[11px] text-slate-500 font-mono">{LANGUAGE_OPTIONS.find((language) => language.code === targetLanguage)?.locale}</span>
              </div>

              <div className="min-h-[90px] text-slate-100 font-sans text-lg md:text-xl leading-relaxed py-2">
                {isLoading ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-5 bg-blue-500/20 rounded w-4/5" />
                    <div className="h-5 bg-blue-500/10 rounded w-3/5" />
                  </div>
                ) : (
                  englishOutput || <span className="text-slate-600 italic text-base">Translation will appear here...</span>
                )}
              </div>
            </div>

            {/* Bottom Card Actions */}
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/5">
              {/* Dual Speaker Button (English) */}
              <button
                onClick={() => handleSpeak('translation')}
                disabled={!englishOutput || isLoading}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${speakingTarget === 'translation'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40 ring-2 ring-blue-400'
                  : englishOutput
                    ? 'bg-blue-500/15 hover:bg-blue-500/25 text-blue-200 border border-blue-500/30'
                    : 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
                  }`}
                title={`Listen in ${LANGUAGE_OPTIONS.find((language) => language.code === targetLanguage)?.label} voice`}
              >
                {speakingTarget === 'translation' ? (
                  <>
                    <VolumeX className="w-4 h-4 text-white animate-pulse" />
                    <span>Stop</span>
                    <div className="flex items-end gap-0.5 ml-1 h-3">
                      <span className="w-1 bg-white rounded-full animate-audio-bar-1" />
                      <span className="w-1 bg-white rounded-full animate-audio-bar-2" />
                      <span className="w-1 bg-white rounded-full animate-audio-bar-3" />
                    </div>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Speak {LANGUAGE_OPTIONS.find((language) => language.code === targetLanguage)?.label}</span>
                  </>
                )}
              </button>

              {/* Copy Button */}
              <button
                onClick={() => handleCopy('english')}
                disabled={!englishOutput || isLoading}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Copy translated text"
              >
                {copiedTarget === 'english' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* History Drawer Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="liquid-glass-strong rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] flex flex-col border border-white/20 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-400" />
                  Recent Translations
                </h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
                {history.length === 0 ? (
                  <p className="text-center text-slate-400 py-8 text-sm">No translations stored yet.</p>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setInput(item.input);
                        setHindiOutput(item.hindi);
                        setEnglishOutput(item.english);
                        setShowHistory(false);
                      }}
                      className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400 font-medium">"{item.input}"</span>
                        <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="text-purple-300 font-medium">{item.hindi}</div>
                        <div className="text-blue-300 font-medium">{item.english}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {history.length > 0 && (
                <div className="pt-3 border-t border-white/10 flex justify-end">
                  <button
                    onClick={() => {
                      setHistory([]);
                      localStorage.removeItem('aura_translate_history');
                    }}
                    className="text-xs text-red-400 hover:text-red-300 underline"
                  >
                    Clear History
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
