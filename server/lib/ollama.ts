import axios from "axios";

function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [ollama] ${message}`);
}

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "phi3:mini";

export async function isOllamaAvailable(): Promise<boolean> {
  if (process.env.VERCEL) return false;
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, {
      timeout: 2000,
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

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
  const maxTokens = options?.maxTokens || 1000;
  const temperature = options?.temperature || 0.3;

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
        timeout: 600000,
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

export async function chatWithOllama(
  messages: Array<{ role: string; content: string }>,
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<string> {
  const model = options?.model || OLLAMA_MODEL;
  const maxTokens = options?.maxTokens || 800;
  const temperature = options?.temperature || 0.3;

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
        timeout: 600000,
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
    await axios.post(`${OLLAMA_BASE_URL}/api/pull`, { name: model }, { timeout: 600000 });
    log(`Model ${model} pulled successfully`);
    return true;
  } catch (error: any) {
    log(`Failed to ensure model ${model}: ${error.message}`);
    return false;
  }
}
