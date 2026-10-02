import { NextResponse } from 'next/server';

const SUPPORTED_LANGUAGES = new Set([
  'auto', 'en', 'hi', 'es', 'fr', 'de', 'bn', 'mr', 'ta', 'te', 'pa',
  'ar', 'ja', 'ko', 'zh-CN', 'ru', 'pt', 'it', 'ur', 'gu', 'kn', 'ml'
]);

async function transliterateHindi(text: string): Promise<string> {
  if (!/[A-Za-z]/.test(text)) return text;

  try {
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=hi-t-i0-und&num=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      next: { revalidate: 3600 }
    });
    const data = await response.json();

    if (response.ok && data?.[0] === 'SUCCESS' && data[1]?.[0]?.[1]?.[0]) {
      return data[1][0][1][0];
    }
  } catch (error) {
    console.warn('Hindi transliteration failed, using original input:', error);
  }

  return text;
}

async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sourceLanguage)}&tl=${encodeURIComponent(targetLanguage)}&dt=t&q=${encodeURIComponent(text)}`;
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
    const result = await translate(text, { from: sourceLanguage === 'auto' ? undefined : sourceLanguage, to: targetLanguage });
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
    const sourceLanguage = typeof body.sourceLanguage === 'string' ? body.sourceLanguage : 'auto';
    const targetLanguage = typeof body.targetLanguage === 'string' ? body.targetLanguage : 'en';

    if (!text) {
      return NextResponse.json(
        { error: 'Please enter text to translate' },
        { status: 400 }
      );
    }

    if (!SUPPORTED_LANGUAGES.has(sourceLanguage) || !SUPPORTED_LANGUAGES.has(targetLanguage)) {
      return NextResponse.json({ error: 'Unsupported source or target language' }, { status: 400 });
    }

    const sourceText = sourceLanguage === 'hi' ? await transliterateHindi(text) : text;
    const translatedText = sourceLanguage === targetLanguage
      ? sourceText
      : await translateText(sourceText, sourceLanguage, targetLanguage);

    return NextResponse.json({
      source: sourceText,
      translation: translatedText || sourceText,
      hindi: sourceText,
      english: translatedText || sourceText,
      sourceLanguage,
      targetLanguage,
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
