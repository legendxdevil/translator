import { NextResponse } from 'next/server';
import { detectScript } from '@/lib/detectScript';

// Primary transliteration using Google Input Tools API (Roman -> Devanagari Hindi)
async function transliterateToHindi(text: string): Promise<string> {
  try {
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=hi-t-i0-und&num=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      next: { revalidate: 3600 }
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data && data[0] === 'SUCCESS' && data[1]?.[0]?.[1]?.[0]) {
        return data[1][0][1][0];
      }
    }
  } catch (error) {
    console.warn('Google Input Tools transliteration failed, using fallback:', error);
  }
  return text;
}

// Translate Hindi (Devanagari) -> English
async function translateHindiToEnglish(hindiText: string): Promise<string> {
  // Method 1: Google Translate GTX endpoint
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(hindiText)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      next: { revalidate: 3600 }
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data[0])) {
        const translatedSegments = data[0]
          .filter((item: Array<string | null>) => item && item[0])
          .map((item: Array<string | null>) => item[0]);
        if (translatedSegments.length > 0) {
          return translatedSegments.join('');
        }
      }
    }
  } catch (error) {
    console.warn('Google GTX translation failed, trying library fallback:', error);
  }

  // Method 2: google-translate-api-x fallback
  try {
    const translate = (await import('google-translate-api-x')).default;
    const result = await translate(hindiText, { to: 'en' });
    return result.text;
  } catch (error) {
    console.error('All translation attempts failed:', error);
    throw new Error('Translation service currently unavailable');
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = (body.text || '').trim();

    if (!text) {
      return NextResponse.json(
        { error: 'Please enter text to translate' },
        { status: 400 }
      );
    }

    const scriptType = detectScript(text);
    let devanagariHindi = '';
    let englishTranslation = '';

    if (scriptType === 'devanagari') {
      // Input is already Devanagari Hindi
      devanagariHindi = text;
      englishTranslation = await translateHindiToEnglish(devanagariHindi);
    } else {
      // Input is Roman script (Hinglish or English)
      devanagariHindi = await transliterateToHindi(text);
      
      // If transliteration returned original text (e.g. pure English or unknown), translate directly
      englishTranslation = await translateHindiToEnglish(
        devanagariHindi !== text ? devanagariHindi : text
      );
    }

    return NextResponse.json({
      hindi: devanagariHindi || text,
      english: englishTranslation || text,
      detectedScript: scriptType === 'devanagari' ? 'hindi' : 'hinglish',
      originalInput: text
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Translation failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
