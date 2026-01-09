import { pipeline } from '@xenova/transformers';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || 'dummy',
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || 'https://api.replit.com/v1/ai/chat/completions',
});

interface RagDocument {
  url: string;
  text: string;
  chunks: string[];
  embeddings: number[][];
}

const vectorStore = new Map<string, RagDocument>();

let extractor: any = null;

async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractor;
}

export async function processUrl(url: string): Promise<void> {
  if (vectorStore.has(url)) return;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  const html = await res.text();

  const $ = cheerio.load(html);
  $('script, style, nav, footer, iframe, noscript').remove();
  const text = $('body').text().replace(/\s+/g, ' ').trim();

  if (text.length < 50) throw new Error("Website content is too short or empty.");

  const words = text.split(' ');
  const chunkSize = 200;
  const overlap = 20;
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }

  const pipe = await getExtractor();
  const embeddings: number[][] = [];

  for (const chunk of chunks) {
    const output = await pipe(chunk, { pooling: 'mean', normalize: true });
    embeddings.push(Array.from(output.data));
  }

  vectorStore.set(url, { url, text, chunks, embeddings });
}

export async function queryRag(url: string, question: string): Promise<{ answer: string; sources: string[] }> {
  const doc = vectorStore.get(url);
  if (!doc) throw new Error("Document not found. Please analyze the URL first.");

  const pipe = await getExtractor();
  const output = await pipe(question, { pooling: 'mean', normalize: true });
  const questionEmbedding = Array.from(output.data) as number[];

  const similarities = doc.embeddings.map((emb, i) => ({
    index: i,
    score: cosineSimilarity(questionEmbedding, emb)
  }));

  similarities.sort((a, b) => b.score - a.score);
  const topChunks = similarities.slice(0, 3).map(s => doc.chunks[s.index]);

  const systemPrompt = `You are a helpful assistant. Answer the user's question strictly based on the provided context. If the answer is not in the context, say "I couldn't find that information in the website."`;
  const userPrompt = `Context:\n${topChunks.join('\n\n')}\n\nQuestion: ${question}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.2
  });

  return {
    answer: response.choices[0].message.content || "No response generated.",
    sources: topChunks
  };
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
