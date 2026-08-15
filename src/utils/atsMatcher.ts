// Lightweight, fully client-side ATS-style keyword matcher.
// No AI/API call — this is term-frequency based, so it catches exact and
// near-exact term overlap well but won't catch synonyms (e.g. "led" vs
// "managed"). Good for a quick gap-check, not a substitute for actually
// reading the posting closely.

const STOPWORDS = new Set([
  'a','an','the','and','or','but','if','of','at','by','for','with','about','against','between',
  'into','through','during','before','after','above','below','to','from','up','down','in','out',
  'on','off','over','under','again','further','then','once','here','there','when','where','why',
  'how','all','any','both','each','few','more','most','other','some','such','no','nor','not',
  'only','own','same','so','than','too','very','s','t','can','will','just','don','should','now',
  'is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing',
  'we','you','your','our','their','they','it','its','this','that','these','those','as','also',
  'will','would','could','shall','may','might','must','who','whom','which','what','while',
  'us','you\'ll','you\'re','we\'re','etc','including','including','across','per','including',
  'looking','strong','ability','experience','years','year','role','team','work','working','join',
  'skills','required','preferred','plus','using','use','including',
]);

export interface KeywordMatchResult {
  matched: string[];
  missing: string[];
  matchPercent: number;
  jobKeywords: { term: string; count: number }[];
}

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z][a-z0-9+.#/-]{1,}/g) || [])
    .map(t => t.replace(/^[-./#]+|[-./#]+$/g, ''))
    .filter(t => t.length > 1 && !STOPWORDS.has(t));
}

/** Extracts multi-word technical/skill phrases in addition to single terms (e.g. "machine learning"). */
function extractPhrases(text: string): string[] {
  const lines = text.split(/[,•\n]/);
  const phrases: string[] = [];
  const phrasePattern = /\b([A-Z][a-zA-Z0-9+.#]*(?:\s[A-Z][a-zA-Z0-9+.#]*){0,2}|[a-z0-9+.#]+(?:\s(?:js|sql|api|ui|ux))\b)/g;
  for (const line of lines) {
    const matches = line.match(phrasePattern);
    if (matches) phrases.push(...matches.map(m => m.toLowerCase().trim()));
  }
  return phrases;
}

export function matchResumeToJobDescription(resumeText: string, jobDescText: string): KeywordMatchResult {
  const jdTokens = tokenize(jobDescText);
  const jdPhrases = extractPhrases(jobDescText);
  const resumeLower = resumeText.toLowerCase();

  // Frequency-count single tokens, then merge in multi-word phrases mentioned 2+ times
  // (a strong signal the posting cares specifically about that term).
  const freq: Record<string, number> = {};
  jdTokens.forEach(t => { freq[t] = (freq[t] || 0) + 1; });

  const phraseFreq: Record<string, number> = {};
  jdPhrases.forEach(p => {
    if (p.split(' ').length >= 2) phraseFreq[p] = (phraseFreq[p] || 0) + 1;
  });

  const topSingleTerms = Object.entries(freq)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25);

  const topPhrases = Object.entries(phraseFreq)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const combined = [...topPhrases, ...topSingleTerms]
    .filter(([term], i, arr) => arr.findIndex(([t]) => t === term) === i) // de-dupe
    .slice(0, 25);

  const matched: string[] = [];
  const missing: string[] = [];

  combined.forEach(([term]) => {
    if (resumeLower.includes(term)) matched.push(term);
    else missing.push(term);
  });

  const matchPercent = combined.length > 0 ? Math.round((matched.length / combined.length) * 100) : 0;

  return {
    matched,
    missing,
    matchPercent,
    jobKeywords: combined.map(([term, count]) => ({ term, count })),
  };
}
