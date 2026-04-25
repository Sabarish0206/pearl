import { extractSkillsFromText, normalizeSkills } from '@pearl/common';

type Report = {
  name: string;
  inputSnippet: string;
  extractedSkillsRaw: string[];
  normalizedSkills: string[];
  expectedNormalized: string[];
  missing: string[];
  falsePositives: string[];
  verdict: 'PASS' | 'FAIL';
  reason: string;
};

const uniqCI = (arr: string[]) => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const a of arr) {
    const k = a.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(a);
  }
  return out;
};

const diffCI = (expected: string[], actual: string[]) => {
  const actualSet = new Set(actual.map((s) => s.toLowerCase()));
  return expected.filter((e) => !actualSet.has(e.toLowerCase()));
};

const extraCI = (expected: string[], actual: string[]) => {
  const expectedSet = new Set(expected.map((s) => s.toLowerCase()));
  return actual.filter((a) => !expectedSet.has(a.toLowerCase()));
};

const runAndReport = (name: string, inputSnippet: string, expectedNormalized: string[]): Report => {
  // Simulate the system: raw resume text -> extractor -> normalized
  const extracted = extractSkillsFromText(inputSnippet);
  const normalizedFromText = extracted.normalized;

  const missing = diffCI(expectedNormalized, normalizedFromText);
  const falsePositives = extraCI(expectedNormalized, normalizedFromText);

  const noDuplicates = uniqCI(normalizedFromText).length === normalizedFromText.length;
  const verdict: Report['verdict'] = missing.length === 0 && falsePositives.length === 0 && noDuplicates ? 'PASS' : 'FAIL';

  const reasonParts: string[] = [];
  if (!noDuplicates) reasonParts.push('Duplicate skills after normalization');
  if (missing.length > 0) reasonParts.push(`Missing skills: ${missing.join(', ')}`);
  if (falsePositives.length > 0) reasonParts.push(`False positives: ${falsePositives.join(', ')}`);
  const reason = reasonParts.length ? reasonParts.join(' | ') : 'All expected skills extracted and normalized with no duplicates';

  return {
    name,
    inputSnippet,
    extractedSkillsRaw: extracted.extractedRaw,
    normalizedSkills: normalizedFromText,
    expectedNormalized,
    missing,
    falsePositives,
    verdict,
    reason,
  };
};

const failWithReport = (r: Report) => {
  // This is intentionally formatted to match the requested output shape per test.
  // Jest will print it on failure.
  // eslint-disable-next-line no-console
  console.log(
    [
      `\n[Skill Parser Accuracy Report] ${r.name}`,
      `Input snippet (raw):\n${r.inputSnippet}`,
      `Extracted skills (raw): ${JSON.stringify(r.extractedSkillsRaw)}`,
      `Normalized skills (industry-standard): ${JSON.stringify(r.normalizedSkills)}`,
      `Missing skills: ${JSON.stringify(r.missing)}`,
      `False positives: ${JSON.stringify(r.falsePositives)}`,
      `Verdict: ${r.verdict} (${r.reason})`,
    ].join('\n')
  );
  throw new Error(`FAIL: ${r.name} -> ${r.reason}`);
};

describe('AI resume parser skill accuracy (deterministic validation layer)', () => {
  describe('CASE 1 — Skill Normalization & Deduplication', () => {
    it('unifies equivalent skills to canonical industry labels (no duplicates, case-insensitive, abbreviations)', () => {
      const rawSkills = [
        'HTML',
        'HTML5',
        'html5',
        'Hyper Text Markup Language',
        'JS',
        'Javascript',
        'java script',
        'ES6',
        'Node',
        'NodeJS',
        'Node.js',
        'Postgres',
        'PostgreSQL',
        'psql',
        'ML',
        'Machine Learning',
        'AI',
        'Artificial Intelligence',
        'k8s',
        'Kubernetes',
        'TF',
        'Tensorflow',
        'TensorFlow 2.0',
      ];

      const norm = normalizeSkills(rawSkills);
      const normalized = norm.normalized;

      // 1) No duplicates
      expect(new Set(normalized.map((s) => s.toLowerCase())).size).toBe(normalized.length);

      // 2) Canonical labels preferred
      const expectedCanonical = [
        'HTML5',
        'JavaScript',
        'Node.js',
        'PostgreSQL',
        'Machine Learning',
        'Artificial Intelligence',
        'Kubernetes',
        'TensorFlow',
      ];
      for (const s of expectedCanonical) expect(normalized).toContain(s);
      expect(normalized.length).toBe(expectedCanonical.length);
    });
  });

  describe('CASE 2 — Skill Extraction Completeness & Accuracy (Critical)', () => {
    it('2a: captures skills mentioned outside skills section (projects/experience/summary)', () => {
      const snippet = [
        'Summary: Built a REST API using FastAPI and deployed it on AWS EC2.',
        'Experience: Intern at Amazon, worked on backend systems.',
      ].join('\n');
      const expected = ['FastAPI', 'REST API', 'AWS EC2'];
      const r = runAndReport('2a scattered mentions', snippet, expected);
      if (r.verdict === 'FAIL') failWithReport(r);
      expect(r.normalizedSkills).toEqual(expect.arrayContaining(expected));
      // Ensure company name does not become AWS
      expect(r.normalizedSkills.map((s) => s.toLowerCase())).not.toContain('aws');
    });

    it('2b: splits comma, slash, bullet, and pipe-separated lists', () => {
      const snippet = [
        'Skills: React / Next.js / Tailwind CSS',
        'Tools: Python, Django, DRF, Celery',
        'Frameworks: Spring Boot | Flask',
        '• NodeJS, Postgres',
      ].join('\n');
      const expected = [
        'React',
        'Next.js',
        'Tailwind CSS',
        'Python',
        'Django',
        'Django REST Framework',
        'Celery',
        'Spring Boot',
        'Flask',
        'Node.js',
        'PostgreSQL',
      ];
      const r = runAndReport('2b list separators', snippet, expected);
      if (r.verdict === 'FAIL') failWithReport(r);
    });

    it('2c: does not silently drop ambiguous/partial skill statements (flags them)', () => {
      const snippet = [
        'Familiar with cloud platforms and distributed systems.',
        'Hands-on experience in scripting for automation.',
      ].join('\n');
      const extracted = extractSkillsFromText(snippet);
      // Must flag rather than silently ignore
      expect(extracted.flaggedAmbiguous).toEqual(expect.arrayContaining(['cloud platforms', 'scripting']));
    });

    it('2d: avoids context misidentification (company/degree are not skills)', () => {
      const snippet = [
        'Experience: Software Engineering Intern at Amazon',
        'Education: Bachelor of Science in Computer Science',
        'Skills: JS, HTML, NodeJS',
      ].join('\n');
      const expected = ['JavaScript', 'HTML5', 'Node.js'];
      const r = runAndReport('2d context misidentification', snippet, expected);
      if (r.verdict === 'FAIL') failWithReport(r);

      const normalizedLC = r.normalizedSkills.map((s) => s.toLowerCase());
      expect(normalizedLC).not.toContain('amazon');
      expect(normalizedLC).not.toContain('bachelor of science');
      expect(normalizedLC).not.toContain('computer science');
    });

    it('2e: extracts all skills from multi-level groupings', () => {
      const snippet = 'Languages: Python, Java | Frameworks: Spring Boot, Flask | Tools: Git, Docker';
      const expected = ['Python', 'Java', 'Spring Boot', 'Flask', 'Git', 'Docker'];
      const r = runAndReport('2e multi-level grouping', snippet, expected);
      if (r.verdict === 'FAIL') failWithReport(r);
    });
  });
});
