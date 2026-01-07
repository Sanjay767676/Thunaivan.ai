import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRequire } from 'module';
import axios from "axios";

const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');
// Handle both CommonJS and ES module exports
const pdf = pdfParseModule.default || pdfParseModule;

// Providers
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const openrouter = new OpenAI({ 
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1" 
});
const grok = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: "https://api.x.ai/v1"
});
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function extractPdfText(url: string): Promise<string> {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const data = await pdf(response.data);
  return data.text;
}

export async function multiModelAnalyze(text: string): Promise<string> {
  // Use gpt-4o for primary analysis
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "Analyze this government scheme PDF. Summarize the key benefits and extract eligibility criteria." },
      { role: "user", content: text.slice(0, 10000) } // Truncate if too large
    ]
  });
  return response.choices[0].message.content || "";
}

export async function getCombinedAnswer(question: string, context: string): Promise<string> {
  // Use OpenRouter (Claude 3.5 Sonnet) for detailed reasoning
  const response = await openrouter.chat.completions.create({
    model: "anthropic/claude-3.5-sonnet",
    messages: [
      { role: "system", content: "You are an AI assistant analyzing a government document. Use the context to answer accurately." },
      { role: "user", content: `Context: ${context}\n\nQuestion: ${question}` }
    ]
  });
  return response.choices[0].message.content || "";
}

export async function speechToText(audioBase64: string): Promise<string> {
  // OpenAI Whisper implementation
  const buffer = Buffer.from(audioBase64, 'base64');
  const response = await openai.audio.transcriptions.create({
    file: await OpenAI.toFile(buffer, 'speech.mp3'),
    model: "whisper-1",
  });
  return response.text;
}
