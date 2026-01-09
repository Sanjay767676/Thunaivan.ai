import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const pdfMetadata = pgTable("pdf_metadata", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull().default("pdf"),
  extractedText: text("extracted_text").notNull(),
  analysisSummary: text("analysis_summary"),
  eligibilityCriteria: jsonb("eligibility_criteria"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  pdfId: integer("pdf_id").notNull().references(() => pdfMetadata.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPdfMetadataSchema = createInsertSchema(pdfMetadata).omit({ id: true, createdAt: true });
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });

export type PdfMetadata = typeof pdfMetadata.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;

export type AnalyzeRequest = {
  url: string;
  filename: string;
};

export type Source = {
  text: string;
  relevance?: number;
};

export const documentChunks = pgTable("document_chunks", {
  id: serial("id").primaryKey(),
  docId: integer("doc_id").notNull(),
  text: text("text").notNull(),
  embedding: jsonb("embedding").notNull(),
  metadata: jsonb("metadata"),
});

export type DocumentChunk = typeof documentChunks.$inferSelect;
export type InsertDocumentChunk = typeof documentChunks.$inferInsert;

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

export const analyzeRequestSchema = z.object({
  url: z.string().url(),
});
