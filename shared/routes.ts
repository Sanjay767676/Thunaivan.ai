import { z } from 'zod';
import { analyzeRequestSchema, chatRequestSchema, chatResponseSchema } from './schema';

export const api = {
  analyze: {
    method: 'POST' as const,
    path: '/api/analyze',
    input: analyzeRequestSchema,
    responses: {
      200: z.object({ sessionId: z.number(), message: z.string() }),
      400: z.object({ message: z.string() })
    }
  },
  chat: {
    method: 'POST' as const,
    path: '/api/chat',
    input: chatRequestSchema,
    responses: {
      200: chatResponseSchema,
      400: z.object({ message: z.string() }),
      500: z.object({ message: z.string() })
    }
  },
  stt: {
    method: 'POST' as const,
    path: '/api/stt',
    responses: {
      200: z.object({ text: z.string() }),
      400: z.object({ message: z.string() })
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
