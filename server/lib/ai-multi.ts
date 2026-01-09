import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRequire } from 'module';
import axios from "axios";
import { generateWithOllama, chatWithOllama, isOllamaAvailable } from "./ollama";

const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');
const pdf = pdfParseModule.PDFParse;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});
const grok = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: "https://api.x.ai/v1"
});
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [ai-multi] ${message}`);
}

export async function extractPdfText(url: string): Promise<string> {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const pdfParser = new pdf({ data: response.data });
  const data = await pdfParser.getText();

  const cleanText = data.text
    .split('\n')
    .map((line: string) => line.trim())
    .join('\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleanText;
}

export async function multiModelAnalyze(text: string): Promise<string> {
  const estimatedPages = Math.ceil(text.length / 2500);
  log(`PDF estimated pages: ${estimatedPages}, text length: ${text.length} characters`);

  const useCloudAPIs = process.env.USE_CLOUD_APIS !== 'false';
  const ollamaAvailable = await isOllamaAvailable();

  if (useCloudAPIs) {
    log(`Cloud APIs enabled, trying Gemini/OpenRouter first for speed`);

    let textToAnalyze = text;
    const maxChars = 80000;

    if (text.length > maxChars) {
      const chunkSize = Math.floor(maxChars / 3);
      const beginning = text.substring(0, chunkSize);
      const middle = text.substring(Math.floor(text.length / 2) - chunkSize / 2, Math.floor(text.length / 2) + chunkSize / 2);
      const end = text.substring(text.length - chunkSize);
      textToAnalyze = `${beginning}\n\n[... ${text.length - maxChars} characters omitted ...]\n\n${middle}\n\n[... continued ...]\n\n${end}`;
      log(`Large PDF detected (${text.length} chars). Using intelligent chunking.`);
    }

    try {
      log(`Trying Gemini fallback as fast primary...`);
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const result = await model.generateContent(
        `You are analyzing a government scheme PDF document (approximately ${estimatedPages} pages). 
        Provide a comprehensive summary including:
        1. Document title and purpose
        2. Key benefits and features
        3. Eligibility criteria
        4. Application process (if mentioned)
        5. Important dates and deadlines
        6. Contact information (if available)
        
        Be thorough but concise. Focus on actionable information.
        
        Analyze this government scheme PDF document:\n\n${textToAnalyze}`
      );
      return result.response.text();
    } catch (geminiError: any) {
      log(`Gemini failed: ${geminiError.message}, falling back to OpenRouter/Ollama`);
    }

    try {
      const response = await openrouter.chat.completions.create({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          {
            role: "system",
            content: `You are analyzing a government scheme PDF document (approximately ${estimatedPages} pages). Provide a thorough summary.`
          },
          {
            role: "user",
            content: `Analyze this document:\n\n${textToAnalyze}`
          }
        ],
        max_tokens: 1500
      });
      return response.choices[0].message.content || "";
    } catch (openrouterError: any) {
      log(`OpenRouter failed, falling back to local Ollama`);
    }
  }

  if (ollamaAvailable) {
    try {
      log(`Using Ollama fallback (Local). Note: This may be slow depending on hardware.`);
      const systemPrompt = `You are a professional document analyst. Provide a DIRECT, structured summary of the government scheme.
        Use bullet points. Avoid introductory fluff. Focus on:
        - Title & Purpose
        - Key Benefits (Monetary & Non-monetary)
        - Eligibility
        - Application Steps
        - Deadlines & Contacts`;
      const maxChunkSize = 24000;
      let textToAnalyze = text.length > maxChunkSize ? text.substring(0, maxChunkSize) : text;

      const summary = await generateWithOllama(
        `Analyze this document and provide a direct summary:\n\n${textToAnalyze}`,
        systemPrompt,
        { maxTokens: 2000, temperature: 0.3 }
      );

      return summary;
    } catch (ollamaError: any) {
      log(`All models failed including local Ollama: ${ollamaError.message}`);
    }
  }

  return `PDF content extracted. AI analysis unavailable. You can still ask questions about the text manually.`;
}

export async function getCombinedAnswer(question: string, context: string): Promise<string> {
  const useCloudAPIs = process.env.USE_CLOUD_APIS !== 'false';
  const ollamaAvailable = await isOllamaAvailable();

  if (useCloudAPIs) {
    log(`Cloud APIs enabled, trying Gemini first for chat speed`);

    let contextToUse = context;
    const maxContextLength = 80000;
    if (context.length > maxContextLength) {
      contextToUse = context.substring(0, maxContextLength) + "\n[... truncated ...]";
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const personaPrompt = `You are a professional AI web content analyst. 
ROLE: Your task is to analyze and answer questions strictly based on the provided document/website content.
STRICT RULES:
- Generate answers using ONLY the information present in the context.
- Do NOT use external knowledge, assumptions, or prior training data.
- If the answer is not explicitly available, respond with: "The requested information is not available on the provided website."
- Do NOT hallucinate.
- Clear, professional, and concise.
- Structured when appropriate (bullet points, steps, headings).
- Human-like and ChatGPT-style responses.
- Cite the website section contextually (e.g., "According to the website...").`;

      const result = await model.generateContent(
        `${personaPrompt}

        Context:
        ${contextToUse}

        Question:
        ${question}`
      );
      return result.response.text();
    } catch (err) {
      log(`Gemini chat failed, fallback to local...`);
    }
  }

  if (ollamaAvailable) {
    try {
      log(`Using Ollama local fallback for chat...`);
      const personaPrompt = `You are a professional AI web content analyst.
ROLE: Answer questions strictly based on the provided content.
STRICT RULES:
- ONLY use information from the context.
- No external knowledge or hallucinations.
- If missing, say: "The requested information is not available on the provided website."
- Structured, professional, and concise.`;

      const messages = [
        {
          role: "system",
          content: personaPrompt
        },
        { role: "user", content: `Context:\n${context}\n\nQuestion: ${question}` }
      ];
      return await chatWithOllama(messages, { maxTokens: 1000 });
    } catch (err) {
      log(`Local Ollama also failed.`);
    }
  }

  return `I'm currently unable to process your question due to API/Local limitations.`;
}

export async function speechToText(audioBase64: string): Promise<string> {
  log("Transcribing audio using Gemini 1.5 Flash...");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "audio/webm",
          data: audioBase64
        }
      },
      { text: "Transcribe this audio exactly as spoken. Return ONLY the transcription text, no preamble." }
    ]);

    const transcription = result.response.text().trim();
    log(`Transcription successful: ${transcription.substring(0, 50)}...`);
    return transcription;
  } catch (error: any) {
    log(`Gemini transcription failed: ${error.message}`);
    throw error;
  }
}
