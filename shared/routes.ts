import { z } from 'zod';

export const api = {
  analyzePdf: {
    method: 'POST' as const,
    path: '/api/analyze-pdf',
    input: z.object({ url: z.string(), filename: z.string() }),
    responses: {
      200: z.object({ id: z.number(), summary: z.string() }),
      400: z.object({ message: z.string() })
    }
  },
  chat: {
    method: 'POST' as const,
    path: '/api/chat',
    input: z.object({ message: z.string(), conversationId: z.number(), pdfId: z.number() }),
    responses: {
      200: z.object({ answer: z.string(), eligibilityPrompt: z.string().optional() }),
      500: z.object({ message: z.string() })
    }
  },
  stt: {
    method: 'POST' as const,
    path: '/api/stt',
    input: z.object({ audioBase64: z.string() }),
    responses: {
      200: z.object({ text: z.string() }),
      500: z.object({ message: z.string() })
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
