'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BlurText } from './BlurText';
import { TranslatorPanel } from './TranslatorPanel';
import { Sparkles, Zap, Volume2, ShieldCheck, Globe2, ArrowRight, Bot, Moon, Sun } from 'lucide-react';

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('aura_theme');
    setIsLightMode(savedTheme === 'light');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('light-theme', isLightMode);
    localStorage.setItem('aura_theme', isLightMode ? 'light' : 'dark');
  }, [isLightMode]);

  // Animated space particle background canvas as fallback & visual enhancement
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Create 120 cosmic star particles
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.8 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      stars.forEach((star) => {
        star.x += star.speedX;
        star.y += star.speedY;

        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        star.opacity += Math.sin(Date.now() * star.pulseSpeed) * 0.008;
        const alpha = Math.max(0.1, Math.min(0.9, star.opacity));

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.shadowBlur = star.size * 3;
        ctx.shadowColor = 'rgba(168, 85, 247, 0.8)';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-slate-950 text-white select-none">
      {/* Space Voyage Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2000&auto=format&fit=crop"
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 filter brightness-90 contrast-110 pointer-events-none scale-105 transform"
      >
        <source
          src="https://assets.mixkit.co/videos/preview/mixkit-flying-through-a-star-field-in-space-27673-large.mp4"
          type="video/mp4"
        />
      </video>

      {/* Particle Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-60"
      />

      {/* Deep Gradient Radial Overlay */}
      <div className={`absolute inset-0 z-0 pointer-events-none ${isLightMode ? 'bg-gradient-to-b from-slate-100/80 via-sky-100/55 to-white/90' : 'bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/90'}`} />

      {/* Navbar (Fixed z-50) */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 flex items-center justify-between pointer-events-none">
        {/* Logo */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-10 h-10 rounded-2xl liquid-glass flex items-center justify-center border border-purple-400/30 text-purple-300 shadow-lg shadow-purple-900/30">
            <Globe2 className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <span className="font-serif italic text-xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-purple-300">
              AuraTranslate
            </span>
            <span className="text-[10px] block text-purple-400 font-sans uppercase tracking-widest -mt-1 font-semibold">
              Hinglish AI
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsLightMode((current) => !current)}
            className="pointer-events-auto flex items-center gap-2 rounded-xl border border-white/15 bg-slate-950/55 px-3 py-2 text-xs text-slate-200 shadow-lg backdrop-blur-xl transition-colors hover:bg-slate-900/75 light-theme:border-slate-300/70 light-theme:bg-white/75 light-theme:text-slate-700 light-theme:hover:bg-white"
            aria-label={isLightMode ? 'Switch to dark mode' : 'Switch to light mode'}
            title={isLightMode ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {isLightMode ? <Moon className="h-4 w-4 text-indigo-500" /> : <Sun className="h-4 w-4 text-amber-300" />}
            <span className="hidden sm:inline">{isLightMode ? 'Dark' : 'Light'}</span>
          </button>
        </div>
      </header>

      {/* Main Split Content Area (50/50 Left & Right) */}
      <main className="relative z-10 pt-24 lg:pt-28 pb-4 flex-1 flex flex-col justify-center max-w-7xl mx-auto px-4 md:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">

          {/* LEFT SIDE COLUMN (Hero Text, Badges & Feature Cards) */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            {/* Liquid Glass Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass border border-purple-400/30 text-purple-200 text-xs md:text-sm font-medium mb-4 shadow-xl"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>New — Hindi + Hinglish → English, Instantly</span>
            </motion.div>

            {/* Animated Left-aligned Heading */}
            <div className="mb-4 w-full">
              <BlurText
                text="Speak Any Language, Understand Every Word."
                className="font-serif italic text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white drop-shadow-2xl justify-start text-left"
              />
            </div>

            {/* AI assistant avatar */}
            <motion.div
              initial={{ opacity: 0, x: -18, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="mb-6 flex items-center gap-4"
            >
              <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-cyan-300/40 bg-slate-950/80 shadow-[0_0_35px_rgba(34,211,238,0.25)]">
                <div className="absolute inset-1 rounded-[1.4rem] border border-cyan-300/20 animate-pulse" />
                <div className="relative flex h-12 w-12 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 via-blue-400 to-purple-500 shadow-lg shadow-cyan-500/30">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-950 shadow-[0_0_7px_rgba(255,255,255,0.9)]" />
                    <span className="h-2 w-2 rounded-full bg-slate-950 shadow-[0_0_7px_rgba(255,255,255,0.9)]" />
                  </div>
                  <span className="mt-2 h-1 w-5 rounded-full bg-slate-950/80" />
                </div>
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Bot className="h-4 w-4 text-cyan-300" />
                  Aura AI
                </div>
                <p className="mt-1 text-xs text-slate-400">Ready to translate and speak</p>
              </div>
            </motion.div>

            {/* Stacked Feature Cards on Left */}
            <motion.div
              id="features"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="space-y-3 w-full"
            >
              {/* Feature 1 */}
              <div className="liquid-glass rounded-2xl p-3.5 border border-white/10 hover:border-purple-400/30 transition-all flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Hinglish Transliteration</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Auto-converts romanized Hindi into authentic Devanagari script instantly.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="liquid-glass rounded-2xl p-3.5 border border-white/10 hover:border-blue-400/30 transition-all flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Dual Native Accent Speakers</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Independent audio playback for Hindi (<span className="font-mono text-purple-300">hi-IN</span>) and English (<span className="font-mono text-blue-300">en-US</span>).
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="liquid-glass rounded-2xl p-3.5 border border-white/10 hover:border-emerald-400/30 transition-all flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Zero Paid API Keys</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Powered by high-performance edge server proxies — 100% free forever.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT SIDE COLUMN (Translator Panel Card) */}
          <div id="translator" className="lg:col-span-7 w-full">
            <TranslatorPanel />
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-3 border-t border-white/10 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} AuraTranslate. Cinematic Hindi & Hinglish Translator.</p>
      </footer>
    </div>
  );
}
