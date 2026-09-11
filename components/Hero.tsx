'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { BlurText } from './BlurText';
import { TranslatorPanel } from './TranslatorPanel';
import { Sparkles, Zap, Volume2, ShieldCheck, Globe2, ArrowRight } from 'lucide-react';

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/90 z-0 pointer-events-none" />

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

            {/* Subheading Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-slate-300 text-sm md:text-base mb-6 font-sans font-light leading-relaxed"
            >
              Type in romanized Hinglish (<span className="text-purple-300 italic">"aap kaise ho"</span>) or Devanagari Hindi. Get accurate Devanagari text and English translations with independent dual-accent text-to-speech.
            </motion.p>

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
