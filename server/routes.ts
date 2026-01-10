import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { createRequire } from 'module';
import { storage } from "./storage.js";
import { db } from "./db.js";
import { pdfMetadata, conversations, messages, insertPdfMetadataSchema, insertMessageSchema } from "../shared/schema.js";
import { extractPdfText, multiModelAnalyze, getCombinedAnswer, speechToText } from "./lib/ai-multi.js";
import { scrapeUrl, analyzeWebContent, searchWeb } from "./lib/web-analysis.js";
import { processPdfForRag, queryPdfRag } from "./lib/pdf-rag.js";
import { eq } from "drizzle-orm";
import { log } from "./utils.js";

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

import { aiRateLimiter, pdfRateLimiter } from "./utils.js";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/analyze-pdf", pdfRateLimiter, upload.single('pdf'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "PDF file is required" });
      }

      const filename = req.file.originalname;
      const fileBuffer = req.file.buffer;

      const fileSizeMB = (fileBuffer.length / 1024 / 1024).toFixed(2);
      log(`Extracting text from PDF: ${filename} (${fileSizeMB} MB)`);

      const pdfData = await pdf(fileBuffer);
      const extractedText = pdfData.text;

      if (!extractedText || extractedText.trim().length === 0) {
        return res.status(400).json({ message: "PDF appears to be empty or unreadable" });
      }

      const textLength = extractedText.length;
      const estimatedPages = Math.ceil(textLength / 2500);
      log(`PDF text extracted: ${textLength.toLocaleString()} characters (~${estimatedPages} pages)`);

      log(`Analyzing PDF content with multiple AI models`);
      let summary: string;
      try {
        summary = await multiModelAnalyze(extractedText);
        if (!summary || summary.trim().length === 0) {
          summary = "PDF content extracted successfully. Analysis summary unavailable.";
          log(`Warning: AI analysis returned empty summary`);
        }
      } catch (aiError: any) {
        log(`AI analysis error: ${aiError.message}`);
        summary = `PDF content extracted successfully. AI analysis encountered an error: ${aiError.message}. You can still ask questions about the document.`;
      }

      let pdfId: number;
      if (db) {
        try {
          const [pdfRecord] = await db.insert(pdfMetadata).values({
            filename,
            url: `uploaded://${filename}`,
            extractedText,
            analysisSummary: summary,
          }).returning();

          pdfId = pdfRecord.id;
          log(`PDF analyzed and stored with ID: ${pdfId}`);

          processPdfForRag(pdfId, extractedText).catch((ragError: any) => {
            log(`RAG processing error (non-critical): ${ragError.message}`);
          });
        } catch (dbError: any) {
          log(`Database error: ${dbError.message}. Using temporary ID.`);
          pdfId = Date.now();
          log(`Using temporary PDF ID: ${pdfId}`);
        }
      } else {
        pdfId = Date.now();
        log(`No database connection. Using temporary PDF ID: ${pdfId}`);
      }

      res.json({ id: pdfId, summary });
    } catch (error: any) {
      log(`Error analyzing PDF: ${error.message}`);
      console.error('Full error:', error);
      res.status(400).json({ message: error.message || "Failed to analyze PDF" });
    }
  });

  app.post("/api/analyze-url", pdfRateLimiter, async (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      log(`Analyzing URL: ${url}`);
      const extractedText = await scrapeUrl(url);

      if (!extractedText || extractedText.trim().length === 0) {
        return res.status(400).json({ message: "URL content appears to be empty or unreadable" });
      }

      log(`Analyzing web content with Gemini`);
      const summary = await analyzeWebContent(extractedText);

      let docId: number;
      if (db) {
        const [record] = await db.insert(pdfMetadata).values({
          filename: new URL(url).hostname,
          url: url,
          type: "web",
          extractedText,
          analysisSummary: summary,
        }).returning();

        docId = record.id;
        log(`Web content analyzed and stored with ID: ${docId}`);

        processPdfForRag(docId, extractedText).catch((ragError: any) => {
          log(`RAG processing error (non-critical): ${ragError.message}`);
        });
      } else {
        docId = Date.now();
        log(`No database connection. Using temporary ID: ${docId}`);
      }

      res.json({ id: docId, summary });
    } catch (error: any) {
      log(`Error analyzing URL: ${error.message}`);
      res.status(400).json({ message: error.message || "Failed to analyze URL" });
    }
  });

  app.post("/api/search", async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }

      log(`Searching web for: ${query}`);
      const results = await searchWeb(query);
      res.json({ results });
    } catch (error: any) {
      log(`Error searching: ${error.message}`);
      res.status(500).json({ message: error.message || "Failed to search web" });
    }
  });

  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const { pdfId } = req.body;

      if (!pdfId) {
        return res.status(400).json({ message: "pdfId is required" });
      }

      if (!db) {
        return res.status(500).json({ message: "Database not configured. Please set DATABASE_URL environment variable." });
      }

      try {
        const [pdfRecord] = await db.select().from(pdfMetadata).where(eq(pdfMetadata.id, pdfId));
        if (!pdfRecord) {
          return res.status(404).json({ message: "PDF not found" });
        }
      } catch (dbError: any) {
        log(`Database error when verifying PDF: ${dbError.message}`);
        return res.status(500).json({ message: "Database connection error" });
      }

      try {
        const [conversation] = await db.insert(conversations).values({
          pdfId: parseInt(pdfId),
        }).returning();

        log(`Conversation created with ID: ${conversation.id}`);

        const [pdfRecord] = await db.select().from(pdfMetadata).where(eq(pdfMetadata.id, parseInt(pdfId)));

        res.json({
          id: conversation.id,
          document: {
            filename: pdfRecord.filename,
            type: pdfRecord.type,
            summary: pdfRecord.analysisSummary
          }
        });
      } catch (dbError: any) {
        log(`Database error when creating conversation: ${dbError.message}`);
        res.status(500).json({ message: "Failed to create conversation" });
      }
    } catch (error: any) {
      log(`Error creating conversation: ${error.message}`);
      res.status(500).json({ message: error.message || "Failed to create conversation" });
    }
  });

  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { message, conversationId, pdfId } = req.body;

      if (!message || !conversationId || !pdfId) {
        return res.status(400).json({ message: "message, conversationId, and pdfId are required" });
      }

      let pdfRecord: any;
      let context: string;

      if (!db) {
        return res.status(500).json({ message: "Database not configured. Please set DATABASE_URL environment variable." });
      }

      try {
        const [record] = await db.select().from(pdfMetadata).where(eq(pdfMetadata.id, pdfId));
        if (!record) {
          return res.status(404).json({ message: "PDF not found in database. Please re-upload the PDF." });
        }
        pdfRecord = record;
      } catch (dbError: any) {
        log(`Database error when fetching PDF: ${dbError.message}`);
        return res.status(500).json({ message: "Database connection error. Please ensure DATABASE_URL is set correctly." });
      }

      let conversationMessages: any[] = [];
      try {
        conversationMessages = await db.select().from(messages)
          .where(eq(messages.conversationId, conversationId))
          .orderBy(messages.createdAt);
      } catch (dbError: any) {
        log(`Database error when fetching messages: ${dbError.message}. Continuing without history.`);
      }

      try {
        const ragResults = await queryPdfRag(pdfId, message, 5);
        const relevantChunks = ragResults.chunks.join('\n\n---\n\n');
        const summary = pdfRecord.analysisSummary || 'No summary available';

        context = `PDF Summary: ${summary}\n\nRelevant sections from the document:\n${relevantChunks}`;
        log(`Using RAG: Retrieved ${ragResults.chunks.length} relevant chunks (reduced from full ${pdfRecord.extractedText.length} chars)`);
      } catch (ragError: any) {
        log(`RAG query failed: ${ragError.message}, using full text fallback`);
        const fullText = pdfRecord.extractedText || '';
        const textLength = fullText.length;
        const contextLength = Math.min(textLength, 20000);

        let contextText = fullText;
        if (textLength > contextLength) {
          const beginning = fullText.substring(0, 10000);
          const end = fullText.substring(textLength - 10000);
          contextText = `${beginning}\n\n[... ${textLength - 20000} characters omitted ...]\n\n${end}`;
        }

        context = `PDF Summary: ${pdfRecord.analysisSummary || 'No summary available'}\n\nDocument Text:\n${contextText}`;
      }

      log(`Getting AI response for chat message`);
      const answer = await getCombinedAnswer(message, context);

      if (db) {
        try {
          await db.insert(messages).values({
            conversationId,
            role: "user",
            content: message,
          });

          await db.insert(messages).values({
            conversationId,
            role: "assistant",
            content: answer,
          });
          log(`Chat response generated and saved`);
        } catch (dbError: any) {
          log(`Database error when saving messages: ${dbError.message}. Response still generated.`);
        }
      } else {
        log(`Chat response generated (database not available, messages not saved)`);
      }

      res.json({ answer });
    } catch (error: any) {
      log(`Error in chat: ${error.message}`);
      console.error('Full chat error:', error);
      res.status(500).json({ message: error.message || "Failed to get chat response" });
    }
  });

  app.post("/api/stt", async (req: Request, res: Response) => {
    try {
      const { audioBase64 } = req.body;

      if (!audioBase64) {
        return res.status(400).json({ message: "audioBase64 is required" });
      }

      log(`Transcribing audio`);
      const text = await speechToText(audioBase64);

      log(`Audio transcribed successfully`);
      res.json({ text });
    } catch (error: any) {
      log(`Error in speech-to-text: ${error.message}`);
      res.status(500).json({ message: error.message || "Failed to transcribe audio" });
    }
  });

  return httpServer;
}

