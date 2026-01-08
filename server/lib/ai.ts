import OpenAI from 'openai';
import { GoogleGenerativeAI } from "@google/generative-ai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});
const xAI = new OpenAI({
  baseURL: "https://api.x.ai/v1",
  apiKey: process.env.GROK_API_KEY,
});
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function multiModelAnalysis(content: string, query: string) {
  const prompt = `Analyze this content and answer: ${query}\n\nContent: ${content.substring(0, 10000)}`;
  
  // Parallel execution for collaboration (simplified consensus)
  const [gpt, grok, gemini] = await Promise.all([
    openai.chat.completions.create({ model: "gpt-4o", messages: [{ role: "user", content: prompt }] }),
    xAI.chat.completions.create({ model: "grok-beta", messages: [{ role: "user", content: prompt }] }),
    genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent(prompt)
  ]);

  return {
    answer: gpt.choices[0].message.content,
    consensus: [
      gpt.choices[0].message.content,
      grok.choices[0].message.content,
      gemini.response.text()
    ]
  };
}

export async function transcribeAudio(buffer: Buffer) {
  const translation = await openai.audio.transcriptions.create({
    file: await OpenAI.toFile(buffer, "audio.wav"),
    model: "whisper-1",
  });
  return translation.text;
}
