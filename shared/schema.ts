import { z } from "zod";

// We don't need a database schema for this session-based RAG app,
// but we define the API schemas here.

export const analyzeRequestSchema = z.object({
  url: z.string().url("Please enter a valid URL")
});

export const chatRequestSchema = z.object({
  message: z.string().min(1, "Question cannot be empty"),
});

export const sourceSchema = z.object({
  text: z.string(),
  relevance: z.number().optional()
});

export const chatResponseSchema = z.object({
  answer: z.string(),
  sources: z.array(sourceSchema)
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
export type Source = z.infer<typeof sourceSchema>;
