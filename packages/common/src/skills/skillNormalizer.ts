// Production-grade skill normalization utilities.
// Kept in @pearl/common so both API and web can share.

export type SkillNormalizationResult = {
  raw: string;
  normalized: string | null;
  reason?: 'empty' | 'stopword' | 'degree' | 'company' | 'unknown';
};

// Canonical, industry-standard labels.
// Key format is a pre-normalized token (see normalizeKey()).
const CANONICAL_SKILL_MAP: Record<string, string> = {
  // HTML
  html: 'HTML5',
  html5: 'HTML5',
  hypertextmarkuplanguage: 'HTML5',
  'hyper-text-markup-language': 'HTML5',
  'hyper text markup language': 'HTML5',

  // JavaScript
  js: 'JavaScript',
  javascript: 'JavaScript',
  'java script': 'JavaScript',
  es6: 'JavaScript',
  ecmascript6: 'JavaScript',
  ecmascript: 'JavaScript',

  // Node.js
  node: 'Node.js',
  nodejs: 'Node.js',
  'node.js': 'Node.js',

  // Postgres
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  psql: 'PostgreSQL',

  // ML / AI
  ml: 'Machine Learning',
  machinelearning: 'Machine Learning',
  'machine learning': 'Machine Learning',

  ai: 'Artificial Intelligence',
  artificialintelligence: 'Artificial Intelligence',
  'artificial intelligence': 'Artificial Intelligence',

  // k8s
  k8s: 'Kubernetes',
  kubernetes: 'Kubernetes',

  // TensorFlow
  tf: 'TensorFlow',
  tensorflow: 'TensorFlow',
  'tensorflow2': 'TensorFlow',
  'tensorflow2.0': 'TensorFlow',
  'tensorflow 2.0': 'TensorFlow',

  // Common additions used in case 2 examples
  fastapi: 'FastAPI',
  'rest api': 'REST API',
  restapi: 'REST API',
  awsec2: 'AWS EC2',
  'aws ec2': 'AWS EC2',
  ec2: 'AWS EC2',

  // Frontend list examples
  react: 'React',
  nextjs: 'Next.js',
  'next.js': 'Next.js',
  tailwindcss: 'Tailwind CSS',
  'tailwind css': 'Tailwind CSS',

  // Backend list examples
  python: 'Python',
  django: 'Django',
  drf: 'Django REST Framework',
  djangorestframework: 'Django REST Framework',
  celery: 'Celery',
  springboot: 'Spring Boot',
  'spring boot': 'Spring Boot',
  flask: 'Flask',
};

// Terms we should not classify as skills (avoid false positives).
const DEGREE_PHRASES = [
  'bachelor of science',
  'bachelor of technology',
  'bachelor of engineering',
  'master of science',
  'master of technology',
  'master of engineering',
  'b.sc',
  'b.tech',
  'b.e',
  'm.sc',
  'm.tech',
  'm.e',
];

// Company names that often get confused with products/services.
// We do NOT map these to cloud services.
const COMPANY_NAMES = ['amazon', 'google', 'microsoft', 'meta', 'oracle', 'ibm'];

const GENERIC_STOPWORDS = new Set([
  'skills',
  'language',
  'languages',
  'framework',
  'frameworks',
  'tools',
  'technologies',
  'technology',
  'platform',
  'platforms',
  'experience',
  'familiar',
  'familiarity',
]);

const cleanWhitespace = (s: string) => s.replace(/\s+/g, ' ').trim();

// Normalize to a lookup key.
// - case-insensitive
// - removes punctuation (keeps dots in node.js / next.js in a secondary path)
// - collapses whitespace
const normalizeKey = (input: string) => {
  const base = cleanWhitespace(input).toLowerCase();
  // keep a version that preserves dots for explicit map hits
  const dotted = base.replace(/[\u2010\u2011\u2012\u2013\u2014]/g, '-');
  const noPunct = base
    .replace(/[\u2010\u2011\u2012\u2013\u2014]/g, '-')
    .replace(/[^a-z0-9\s.#+-]/g, '')
    .trim();
  const compact = noPunct.replace(/\s+/g, ' ');
  const squashed = compact.replace(/[\s.]/g, '');
  return { base, dotted, compact, squashed };
};

export const normalizeSkill = (raw: string): SkillNormalizationResult => {
  const trimmed = cleanWhitespace(raw);
  if (!trimmed) return { raw, normalized: null, reason: 'empty' };

  const lower = trimmed.toLowerCase();
  if (GENERIC_STOPWORDS.has(lower)) return { raw, normalized: null, reason: 'stopword' };
  if (DEGREE_PHRASES.some((p) => lower.includes(p))) return { raw, normalized: null, reason: 'degree' };
  if (COMPANY_NAMES.includes(lower)) return { raw, normalized: null, reason: 'company' };

  const k = normalizeKey(trimmed);

  // Prefer explicit dotted/compact keys first, then squashed.
  const canonical =
    CANONICAL_SKILL_MAP[k.dotted] ??
    CANONICAL_SKILL_MAP[k.compact] ??
    CANONICAL_SKILL_MAP[k.squashed] ??
    CANONICAL_SKILL_MAP[k.base];

  if (canonical) return { raw, normalized: canonical };

  // Fallback: title-case very simple single words (keeps existing capitalization like FastAPI if user typed it)
  // We intentionally do NOT attempt aggressive mapping here.
  if (trimmed.length <= 2) return { raw, normalized: null, reason: 'unknown' };
  return { raw, normalized: trimmed };
};

export const normalizeSkills = (skills: string[]): { raw: string[]; normalized: string[]; dropped: SkillNormalizationResult[] } => {
  const dropped: SkillNormalizationResult[] = [];
  const normalized: string[] = [];
  for (const s of skills) {
    const r = normalizeSkill(s);
    if (!r.normalized) {
      dropped.push(r);
      continue;
    }
    normalized.push(r.normalized);
  }
  // De-duplicate by case-insensitive canonical label.
  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const s of normalized) {
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(s);
  }
  return { raw: skills, normalized: deduped, dropped };
};
