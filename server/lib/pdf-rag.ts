import { pipeline } from '@xenova/transformers';
import { db } from "../db";
import { pdfMetadata } from "@shared/schema";
import { eq } from "drizzle-orm";

// In-memory cache for PDF chunks and embeddings
interface PdfRagDocument {
  pdfId: number;
  text: string;
  chunks: string[];
  embeddings: number[][];
  chunkMetadata: Array<{ start: number; end: number; page?: number }>;
}

const vectorStore = new Map<number, PdfRagDocument>();

// Singleton for embedding pipeline
let extractor: any = null;

async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractor;
}

/**
 * Chunk PDF text intelligently for RAG
 * Optimized for 10-150 page PDFs
 */
function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): {
  chunks: string[];
  metadata: Array<{ start: number; end: number }>;
} {
  const chunks: string[] = [];
  const metadata: Array<{ start: number; end: number }> = [];

  // Split by sentences first for better chunking
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  let currentChunk = '';
  let startIndex = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const potentialChunk = currentChunk + sentence;

    if (potentialChunk.length > chunkSize && currentChunk.length > 0) {
      // Save current chunk
      chunks.push(currentChunk.trim());
      metadata.push({
        start: startIndex,
        end: startIndex + currentChunk.length
      });

      // Start new chunk with overlap
      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + sentence;
      startIndex = startIndex + currentChunk.length - overlap - sentence.length;
    } else {
      currentChunk = potentialChunk;
    }
  }

  // Add final chunk
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
    metadata.push({
      start: startIndex,
      end: startIndex + currentChunk.length
    });
  }

  return { chunks, metadata };
}

/**
 * Process PDF text into chunks and embeddings for RAG
 */
export async function processPdfForRag(pdfId: number, text: string): Promise<void> {
  if (vectorStore.has(pdfId)) {
    return; // Already processed
  }

  console.log(`[pdf-rag] Processing PDF ${pdfId} for RAG (${text.length} characters)`);

  // Clean text again just to be safe (whitespace normalization)
  const cleanText = text
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Chunk the text (optimized for large PDFs)
  const { chunks, metadata } = chunkText(cleanText, 1000, 200);
  console.log(`[pdf-rag] Created ${chunks.length} chunks from PDF ${pdfId}`);

  // Generate embeddings in batches to avoid memory issues
  const pipe = await getExtractor();
  const embeddings: number[][] = [];

  // Process embeddings in batches of 10
  const batchSize = 10;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const batchEmbeddings = await Promise.all(
      batch.map(chunk =>
        pipe(chunk, { pooling: 'mean', normalize: true }).then((output: any) =>
          Array.from(output.data)
        )
      )
    );
    embeddings.push(...batchEmbeddings);

    if (i % 50 === 0) {
      console.log(`[pdf-rag] Processed ${Math.min(i + batchSize, chunks.length)}/${chunks.length} chunks`);
    }
  }

  vectorStore.set(pdfId, {
    pdfId,
    text,
    chunks,
    embeddings,
    chunkMetadata: metadata
  });

  console.log(`[pdf-rag] PDF ${pdfId} RAG processing complete`);
}

/**
 * Query RAG system to find relevant chunks for a question
 * Returns top-k most relevant chunks
 */
export async function queryPdfRag(
  pdfId: number,
  question: string,
  topK: number = 3
): Promise<{ chunks: string[]; scores: number[] }> {
  const doc = vectorStore.get(pdfId);
  if (!doc) {
    // Try to load from database and process
    if (db) {
      try {
        const [pdfRecord] = await db.select().from(pdfMetadata).where(eq(pdfMetadata.id, pdfId));
        if (pdfRecord && pdfRecord.extractedText) {
          await processPdfForRag(pdfId, pdfRecord.extractedText);
          const retryDoc = vectorStore.get(pdfId);
          if (retryDoc) {
            return queryPdfRag(pdfId, question, topK);
          }
        }
      } catch (error: any) {
        console.error(`[pdf-rag] Error loading PDF from database: ${error.message}`);
      }
    }
    throw new Error(`PDF ${pdfId} not found in RAG store. Please re-upload the PDF.`);
  }

  // Embed the question
  const pipe = await getExtractor();
  const output = await pipe(question, { pooling: 'mean', normalize: true });
  const questionEmbedding = Array.from(output.data) as number[];

  // Find similar chunks using cosine similarity
  const similarities = doc.embeddings.map((emb, i) => ({
    index: i,
    score: cosineSimilarity(questionEmbedding, emb)
  }));

  // Get top-k chunks
  similarities.sort((a, b) => b.score - a.score);
  const topResults = similarities.slice(0, topK);

  return {
    chunks: topResults.map(r => doc.chunks[r.index]),
    scores: topResults.map(r => r.score)
  };
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dot / denominator;
}

/**
 * Clear RAG cache for a PDF (useful for memory management)
 */
export function clearPdfRag(pdfId: number): void {
  vectorStore.delete(pdfId);
}

