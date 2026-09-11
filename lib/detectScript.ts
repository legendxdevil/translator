export type ScriptType = 'devanagari' | 'roman';

/**
 * Detects whether the input text is in Devanagari script or Roman script (Hinglish/Latin).
 */
export function detectScript(text: string): ScriptType {
  const devanagariRegex = /[\u0900-\u097F]/;
  return devanagariRegex.test(text) ? 'devanagari' : 'roman';
}
