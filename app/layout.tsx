import type { Metadata } from "next";
import { Instrument_Serif, Barlow } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument",
});

const barlow = Barlow({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-barlow",
});

export const metadata: Metadata = {
  title: "AuraTranslate — Hinglish & Hindi to English AI Translator",
  description: "Translate Hinglish (Roman Hindi) and Devanagari Hindi into flawless English with dual voice text-to-speech audio in native accents.",
  keywords: ["Hinglish translator", "Hindi to English", "Devanagari translator", "Hindi Text to Speech", "AI translator"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${barlow.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30 selection:text-purple-200">
        {children}
      </body>
    </html>
  );
}
