import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { createRequire } from 'module';
import { storage } from "./storage";
import { db } from "./db";
import { pdfMetadata, conversations, messages, insertPdfMetadataSchema, insertMessageSchema } from "@shared/schema";
import { extractPdfText, multiModelAnalyze, getCombinedAnswer, speechToText } from "./lib/ai-multi";
import { eq } from "drizzle-orm";
import { log } from "./index";

const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');
// Handle both CommonJS and ES module exports
const pdf = pdfParseModule.default || pdfParseModule;

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // POST /api/analyze-pdf - Analyze a PDF document (file upload)
  app.post("/api/analyze-pdf", upload.single('pdf'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "PDF file is required" });
      }

      const filename = req.file.originalname;
      const fileBuffer = req.file.buffer;

      log(`Extracting text from PDF: ${filename}`);
      
      // Extract text from PDF buffer
      const pdfData = await pdf(fileBuffer);
      const extractedText = pdfData.text;

      if (!extractedText || extractedText.trim().length === 0) {
        return res.status(400).json({ message: "PDF appears to be empty or unreadable" });
      }

      // Analyze the PDF using AI (multi-model)
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

      // Store in database (using a placeholder URL for uploaded files)
      let pdfId: number;
      if (db) {
        try {
          const [pdfRecord] = await db.insert(pdfMetadata).values({
            filename,
            url: `uploaded://${filename}`, // Placeholder for uploaded files
            extractedText,
            analysisSummary: summary,
          }).returning();

          pdfId = pdfRecord.id;
          log(`PDF analyzed and stored with ID: ${pdfId}`);
        } catch (dbError: any) {
          log(`Database error: ${dbError.message}. Using temporary ID.`);
          // If database fails, use a temporary ID (timestamp-based)
          pdfId = Date.now();
          log(`Using temporary PDF ID: ${pdfId}`);
        }
      } else {
        // No database connection - use temporary ID
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

  // POST /api/chat - Chat with AI about a PDF
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { message, conversationId, pdfId } = req.body;

      if (!message || !conversationId || !pdfId) {
        return res.status(400).json({ message: "message, conversationId, and pdfId are required" });
      }

      // Get PDF context
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

      // Get conversation history
      let conversationMessages: any[] = [];
      try {
        conversationMessages = await db.select().from(messages)
          .where(eq(messages.conversationId, conversationId))
          .orderBy(messages.createdAt);
      } catch (dbError: any) {
        log(`Database error when fetching messages: ${dbError.message}. Continuing without history.`);
      }

      // Build context from PDF and conversation history
      context = `PDF Summary: ${pdfRecord.analysisSummary || 'No summary available'}\n\nExtracted Text: ${(pdfRecord.extractedText || '').substring(0, 5000)}`;

      // Get AI response
      log(`Getting AI response for chat message`);
      const answer = await getCombinedAnswer(message, context);

      // Save messages (optional - continue even if database fails)
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

  // POST /api/stt - Speech to text
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
