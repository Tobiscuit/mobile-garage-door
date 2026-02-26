import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY NOT SET');
  
  const genAI = new GoogleGenAI({ apiKey });
  const enPath = path.resolve('messages/en.json');
  const viPath = path.resolve('messages/vi.json');
  
  const enData = fs.readFileSync(enPath, 'utf8');

  console.log('⏳ Translating UI strings to Vietnamese...');
  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Translate the following JSON from English to Vietnamese.
The audience is Houston-area homeowners and contractors looking for garage door repair/installation.
Keep it professional.
Return ONLY valid JSON with the exact same keys, no markdown blocks, no code blocks, no explanations.

${enData}`,
  });

  let text = response.text || '';
  text = text.trim();
  if (text.startsWith('```json')) {
    text = text.replace(/^```json\n/, '').replace(/\n```$/, '');
  }
  if (text.startsWith('```')) {
    text = text.replace(/^```\n/, '').replace(/\n```$/, '');
  }

  // Verify it's valid JSON
  try {
    JSON.parse(text);
  } catch (err) {
    console.error('❌ Model returned invalid JSON:');
    console.error(text);
    process.exit(1);
  }

  fs.writeFileSync(viPath, text);
  console.log('✅ messages/vi.json successfully created!');
}

run().catch(console.error);
