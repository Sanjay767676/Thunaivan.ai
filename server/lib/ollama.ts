import axios from "axios";

// Helper function for logging
function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [ollama] ${message}`);
}

// Ollama configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
// Use qwen2.5:7b as default (user preference), with fallback to other models
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "phi3:mini"; // Exact model name confirmed from 'ollama list'

/**
 * Check if Ollama is available
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, {
      timeout: 2000,
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

/**
 * Generate text using Ollama (unlimited, free, local)
 */
export async function generateWithOllama(
  prompt: string,
  systemPrompt?: string,
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<string> {
  const model = options?.model || OLLAMA_MODEL;
  const maxTokens = options?.maxTokens || 1000; // Increased for better quality
  const temperature = options?.temperature || 0.3; // Balanced temperature

  try {
    log(`Generating with Ollama model: ${model}`);

    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/generate`,
      {
        model,
        prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
        stream: false,
        options: {
          num_predict: maxTokens,
          temperature,
        },
      },
      {
        timeout: 600000, // 10 minutes (increased to allow model to complete)
      }
    );

    if (response.data?.response) {
      log(`Ollama response generated successfully`);
      return response.data.response;
    }

    throw new Error("Ollama returned empty response");
  } catch (error: any) {
    if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
      log(`Ollama not available at ${OLLAMA_BASE_URL}. Install Ollama: https://ollama.ai`);
      throw new Error("Ollama is not running. Please install and start Ollama.");
    }
    log(`Ollama error: ${error.message}`);
    throw error;
  }
}

/**
 * Chat completion using Ollama (for conversation context)
 */
export async function chatWithOllama(
  messages: Array<{ role: string; content: string }>,
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<string> {
  const model = options?.model || OLLAMA_MODEL;
  const maxTokens = options?.maxTokens || 800; // Increased for better quality
  const temperature = options?.temperature || 0.3; // Balanced temperature

  try {
    log(`Chatting with Ollama model: ${model}`);

    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/chat`,
      {
        model,
        messages: messages.map(msg => ({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
        })),
        stream: false,
        options: {
          num_predict: maxTokens,
          temperature,
        },
      },
      {
        timeout: 600000, // 10 minutes (increased to allow model to complete)
      }
    );

    if (response.data?.message?.content) {
      log(`Ollama chat response generated successfully`);
      return response.data.message.content;
    }

    throw new Error("Ollama returned empty response");
  } catch (error: any) {
    if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
      log(`Ollama not available at ${OLLAMA_BASE_URL}. Install Ollama: https://ollama.ai`);
      throw new Error("Ollama is not running. Please install and start Ollama.");
    }
    log(`Ollama error: ${error.message}`);
    throw error;
  }
}

/**
 * Pull/download a model if not available
 */
export async function ensureModel(model: string = OLLAMA_MODEL): Promise<boolean> {
  try {
    log(`Checking if model ${model} is available...`);
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    const models = response.data?.models || [];
    const modelExists = models.some((m: any) => m.name === model || m.name.startsWith(model));

    if (modelExists) {
      log(`Model ${model} is already available`);
      return true;
    }

    log(`Model ${model} not found. Pulling from Ollama...`);
    await axios.post(`${OLLAMA_BASE_URL}/api/pull`, { name: model }, { timeout: 600000 }); // 10 minutes
    log(`Model ${model} pulled successfully`);
    return true;
  } catch (error: any) {
    log(`Failed to ensure model ${model}: ${error.message}`);
    return false;
  }
}

