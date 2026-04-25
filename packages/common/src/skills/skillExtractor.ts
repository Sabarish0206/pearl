// Deterministic skill extraction from raw resume text.
// This complements AI parsing and is primarily used for validation and zero-loss extraction.

import { normalizeSkills } from './skillNormalizer';

export type ExtractSkillsResult = {
  input: string;
  extractedRaw: string[];
  normalized: string[];
  flaggedAmbiguous: string[];
};

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

// Split common list separators while preserving things like "Node.js".
const splitCandidates = (text: string): string[] => {
  // Convert bullets and pipes to commas, keep slashes as separators.
  const unified = text
    .replace(/[•\u2022]/g, ',')
    .replace(/[|]/g, ',')
    .replace(/[\/]/g, ',')
    .replace(/[;]+/g, ',');

  return unified
    .split(',')
    .map((s) => clean(s))
    .filter(Boolean);
};

// A small phrase-based extractor for key skills that appear in sentences.
// This is not meant to be exhaustive; it exists to cover high-signal, resume-common mentions.
const PHRASE_PATTERNS: Array<{ re: RegExp; skill: string }> = [
  { re: /\bfastapi\b/i, skill: 'FastAPI' },
  { re: /\brest\s*api\b/i, skill: 'REST API' },
  { re: /\bnode\.?js\b/i, skill: 'Node.js' },
  { re: /\bpostgre\s*sql\b|\bpostgres\b|\bpsql\b/i, skill: 'PostgreSQL' },
  { re: /\bhtml\s*5\b|\bhtml5\b|\bhyper\s*text\s*markup\s*language\b|\bhtml\b/i, skill: 'HTML5' },
  // Avoid matching "Next.js" / "Node.js" (".js") as plain "JS".
  { re: /\bjava\s*script\b|\bjavascript\b|(?<!\.)\bjs\b|\bes6\b/i, skill: 'JavaScript' },
  { re: /\bk8s\b|\bkubernetes\b/i, skill: 'Kubernetes' },
  { re: /\btensor\s*flow\b|\btensorflow\b|\btf\b/i, skill: 'TensorFlow' },
  { re: /\bmachine\s*learning\b|\bml\b/i, skill: 'Machine Learning' },
  { re: /\bartificial\s*intelligence\b|\bai\b/i, skill: 'Artificial Intelligence' },
  // Cloud: keep conservative to avoid "Amazon" => AWS.
  { re: /\baws\s*ec2\b|\bec2\b/i, skill: 'AWS EC2' },
];

const AMBIGUOUS_PATTERNS: Array<{ re: RegExp; flag: string }> = [
  { re: /\bcloud\s+platforms?\b/i, flag: 'cloud platforms' },
  { re: /\bscripting\b/i, flag: 'scripting' },
];

export const extractSkillsFromText = (input: string): ExtractSkillsResult => {
  const text = input ?? '';
  const extracted: string[] = [];

  const looksLikeListLine = (l: string) => {
    const trimmed = l.trim();
    if (!trimmed) return false;

    // Strong signals.
    if (/^[•\u2022\-\*]\s+/.test(trimmed)) return true;
    if (/[|/]/.test(trimmed)) return true;

    // Commas are common in sentences; require higher density when there's no header.
    const commaCount = (trimmed.match(/,/g) ?? []).length;
    if (commaCount >= 2) return true;

    return false;
  };

  // 1) Phrase patterns across the entire text (skills outside skills section).
  for (const p of PHRASE_PATTERNS) {
    if (p.re.test(text)) extracted.push(p.skill);
  }

  // 2) Parse explicit "Skills:"-style lists and grouped lists.
  // We capture content after common headers on each line.
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const l = line.trim();
    if (!l) continue;
    // Examples: "Skills: Python, Django" or "Languages: Python, Java | Frameworks: Flask"
    const headerSplit = l.split(/\b(?:skills|languages|frameworks|tools|technologies)\s*:\s*/i);
    if (headerSplit.length > 1) {
      // Everything after the first header token may still include other grouped headers.
      const tail = headerSplit.slice(1).join(' ');
      // Further split any additional group headers.
      const pieces = tail.split(/\b(?:languages|frameworks|tools|technologies)\s*:\s*/i);
      for (const piece of pieces) {
        extracted.push(...splitCandidates(piece));
      }
      continue;
    }

    // Also handle non-header lines that look like pure lists.
    if (looksLikeListLine(l) && l.length <= 160) extracted.push(...splitCandidates(l));
  }

  // 3) Normalize + dedupe.
  const { normalized } = normalizeSkills(extracted);

  // 4) Ambiguous flags (must not be silently dropped).
  const flagged = new Set<string>();
  for (const a of AMBIGUOUS_PATTERNS) {
    if (a.re.test(text)) flagged.add(a.flag);
  }

  return {
    input: text,
    extractedRaw: extracted,
    normalized,
    flaggedAmbiguous: [...flagged],
  };
};
