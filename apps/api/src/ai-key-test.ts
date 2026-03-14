import { GoogleGenAI } from '@google/genai';
import './config/env';

async function main() {
  const apiKey = process.env.AI_STUDIO_API_KEY;
  console.log('AI_STUDIO_API_KEY present:', !!apiKey);

  if (!apiKey) {
    console.error('No AI_STUDIO_API_KEY set in environment');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say "ok" if this API key is valid.',
    });

    console.log('Gemini response text:', response.text);
  } catch (err) {
    console.error('Gemini error while testing key:', err);
  }
}

main();
