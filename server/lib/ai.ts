import axios from 'axios';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function queryMultiModels(context: string, question: string) {
  const prompt = `Context: ${context}\n\nQuestion: ${question}\n\nAnalyze this and check if the user is eligible for any government schemes mentioned.`;

  const results: Record<string, string> = {};

  // OpenAI
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }]
    });
    results['openai'] = res.choices[0].message.content || "";
  } catch (e) { results['openai'] = "Error"; }

  // OpenRouter (using OpenRouter SDK or generic axios)
  try {
    const res = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "google/gemini-pro-1.5",
      messages: [{ role: "user", content: prompt }]
    }, {
      headers: { "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}` }
    });
    results['openrouter'] = res.data.choices[0].message.content;
  } catch (e) { results['openrouter'] = "Error"; }

  // Grok (assuming OpenAI compatible endpoint or direct)
  try {
    const res = await axios.post("https://api.x.ai/v1/chat/completions", {
      model: "grok-beta",
      messages: [{ role: "user", content: prompt }]
    }, {
      headers: { "Authorization": `Bearer ${process.env.GROK_API_KEY}` }
    });
    results['grok'] = res.data.choices[0].message.content;
  } catch (e) { results['grok'] = "Error"; }

  // Consolidate
  const consolidationPrompt = `Here are responses from 3 models regarding a PDF query:\n${JSON.stringify(results)}\n\nProvide a final, accurate answer and eligibility summary.`;
  const final = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: consolidationPrompt }]
  });

  return {
    answer: final.choices[0].message.content,
    modelResponses: results
  };
}

export async function speechToText(audioBuffer: Buffer) {
  // Use Whisper via OpenAI
  const response = await openai.audio.transcriptions.create({
    file: await OpenAI.toFile(audioBuffer, "audio.wav"),
    model: "whisper-1",
  });
  return response.text;
}
