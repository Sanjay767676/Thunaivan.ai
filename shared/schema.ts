import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const pdfMetadata = pgTable("pdf_metadata", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  extractedText: text("extracted_text").notNull(),
  analysisSummary: text("analysis_summary"),
  eligibilityCriteria: jsonb("eligibility_criteria"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  pdfId: serial("pdf_id").references(() => pdfMetadata.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: serial("conversation_id").references(() => conversations.id),
  role: text("role").notNull(), // 'user', 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPdfMetadataSchema = createInsertSchema(pdfMetadata).omit({ id: true, createdAt: true });
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });

export type PdfMetadata = typeof pdfMetadata.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;

export type AnalyzePdfRequest = {
  url: string;
  filename: string;
};

export type ChatRequest = {
  message: string;
  conversationId: number;
  pdfId: number;
};

export type ChatResponse = {
  answer: string;
  eligibilityPrompt?: string;
};

export type SttRequest = {
  audioBase64: string;
};

export type SttResponse = {
  text: string;
};

// Client/server shared validation schemas
export const analyzeRequestSchema = z.object({
  url: z.string().url(),
});
