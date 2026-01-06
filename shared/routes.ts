import { z } from 'zod';
import { analyzeRequestSchema, chatRequestSchema, chatResponseSchema } from './schema';

export const api = {
  analyze: {
    method: 'POST' as const,
    path: '/api/analyze',
    input: analyzeRequestSchema,
    responses: {
      200: z.object({ success: z.boolean(), message: z.string() }),
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
  }
};
