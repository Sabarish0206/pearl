// Minimal AI integration stub using Google AI Studio / Gemini.
// This keeps your AI key in the environment and never exposes it to clients.

// Import per official docs: named export GoogleGenAI
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.AI_STUDIO_API_KEY;
// Basic visibility so you can confirm at startup whether the key is loaded
// (does not print the key value itself).
// eslint-disable-next-line no-console
console.log('AI_STUDIO_API_KEY present in api.service:', !!apiKey);

export type ParsedResume = {
  name: string | null;
  email: string | null;
  phone: string | null;
  skills: string[];
  experience: string[];
  education: string[];
  summary: string | null;
};

export async function sendResumeToAI(fileBuffer: Buffer, mimeType: string): Promise<ParsedResume | null> {
  if (!apiKey) {
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });

  const base64 = fileBuffer.toString('base64');

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: [
              'You are a resume parser.',
              'You will receive a resume file as binary data (PDF, DOCX, or similar).',
              'Use ONLY the file contents to extract information.',
              '',
              'Based on the resume content, extract structured information and return ONLY a JSON object with this exact shape:',
              '{',
              '  "name": string | null,',
              '  "email": string | null,',
              '  "phone": string | null,',
              '  "skills": string[],',
              '  "experience": string[],',
              '  "education": string[],',
              '  "summary": string | null',
              '}',
              '',
              'Rules:',
              '- Respond with JSON only, no markdown, no backticks, no explanation.',
              '- If a field is unknown, set it to null (for strings) or [] (for arrays).',
            ].join('\n'),
          },
          {
            inlineData: {
              data: base64,
              mimeType,
            },
          },
        ],
      },
    ],
  });

  let raw = response.text ?? '';

  const tryParse = (text: string): ParsedResume | null => {
    try {
      return JSON.parse(text) as ParsedResume;
    } catch {
      return null;
    }
  };

  // 1) Try direct JSON
  let parsed = tryParse(raw);
  if (parsed) return parsed;

  // 2) Strip common markdown fences ```json ... ```
  raw = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  parsed = tryParse(raw);
  if (parsed) return parsed;

  // 3) Fallback: extract the first {...} block
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const snippet = raw.slice(firstBrace, lastBrace + 1);
    parsed = tryParse(snippet);
    if (parsed) return parsed;
  }

  // eslint-disable-next-line no-console
  console.error('AI returned non-JSON or unparsable resume output:', raw);
  return null;
}
