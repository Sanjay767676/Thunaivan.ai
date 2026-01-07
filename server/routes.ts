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
const pdf = require('pdf-parse');

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
      const summary = await multiModelAnalyze(extractedText);

      // Store in database (using a placeholder URL for uploaded files)
      const [pdfRecord] = await db.insert(pdfMetadata).values({
        filename,
        url: `uploaded://${filename}`, // Placeholder for uploaded files
        extractedText,
        analysisSummary: summary,
      }).returning();

      log(`PDF analyzed and stored with ID: ${pdfRecord.id}`);
      res.json({ id: pdfRecord.id, summary });
    } catch (error: any) {
      log(`Error analyzing PDF: ${error.message}`);
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
      const [pdfRecord] = await db.select().from(pdfMetadata).where(eq(pdfMetadata.id, pdfId));
      if (!pdfRecord) {
        return res.status(404).json({ message: "PDF not found" });
      }

      // Get conversation history
      const conversationMessages = await db.select().from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(messages.createdAt);

      // Build context from PDF and conversation history
      const context = `PDF Summary: ${pdfRecord.analysisSummary}\n\nExtracted Text: ${pdfRecord.extractedText.substring(0, 5000)}`;

      // Get AI response
      log(`Getting AI response for chat message`);
      const answer = await getCombinedAnswer(message, context);

      // Save user message
      await db.insert(messages).values({
        conversationId,
        role: "user",
        content: message,
      });

      // Save assistant message
      await db.insert(messages).values({
        conversationId,
        role: "assistant",
        content: answer,
      });

      log(`Chat response generated and saved`);
      res.json({ answer });
    } catch (error: any) {
      log(`Error in chat: ${error.message}`);
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
