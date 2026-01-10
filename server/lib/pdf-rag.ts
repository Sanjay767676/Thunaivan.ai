import { pipeline } from '@xenova/transformers';
import { db } from "../db.js";
import { pdfMetadata, documentChunks } from "../../shared/schema.js";
import { eq } from "drizzle-orm";

let extractor: any = null;

async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractor;
}

function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): {
  chunks: string[];
  metadata: Array<{ start: number; end: number }>;
} {
  const chunks: string[] = [];
  const metadata: Array<{ start: number; end: number }> = [];

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  let currentChunk = '';
  let startIndex = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const potentialChunk = currentChunk + sentence;

    if (potentialChunk.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      metadata.push({
        start: startIndex,
        end: startIndex + currentChunk.length
      });

      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + sentence;
      startIndex = startIndex + currentChunk.length - overlap - sentence.length;
    } else {
      currentChunk = potentialChunk;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
    metadata.push({
      start: startIndex,
      end: startIndex + currentChunk.length
    });
  }

  return { chunks, metadata };
}

export async function processPdfForRag(docId: number, text: string): Promise<void> {
  try {
    if (!db) return;

    log(`[doc-rag] Processing document ${docId} for RAG (${text.length} characters)`);

    const existingChunks = await db.select().from(documentChunks).where(eq(documentChunks.docId, docId));
    if (existingChunks.length > 0) {
      log(`[doc-rag] Document ${docId} already processed for RAG`);
      return;
    }

    const cleanText = text
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const { chunks, metadata } = chunkText(cleanText, 1000, 200);
    log(`[doc-rag] Created ${chunks.length} chunks from document ${docId}`);

    const pipe = await getExtractor();

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

      const inserts = batch.map((chunk, j) => ({
        docId,
        text: chunk,
        embedding: batchEmbeddings[j],
        metadata: metadata[i + j] || {}
      }));

      await db.insert(documentChunks).values(inserts);

      if (i % 50 === 0) {
        log(`[doc-rag] Embedded and stored ${Math.min(i + batchSize, chunks.length)}/${chunks.length} chunks`);
      }
    }

    log(`[doc-rag] Document ${docId} RAG processing complete and stored in database`);
  } catch (error: any) {
    log(`[doc-rag] Error processing document for RAG: ${error.message}`);
    throw error;
  }
}

function log(message: string) {
  console.log(message);
}

export async function queryPdfRag(
  docId: number,
  question: string,
  topK: number = 3
): Promise<{ chunks: string[]; scores: number[] }> {
  try {
    if (!db) throw new Error("Database not connected");

    const allChunks = await db.select().from(documentChunks).where(eq(documentChunks.docId, docId));

    if (allChunks.length === 0) {
      const [docRecord] = await db.select().from(pdfMetadata).where(eq(pdfMetadata.id, docId));
      if (docRecord && docRecord.extractedText) {
        await processPdfForRag(docId, docRecord.extractedText);
        return queryPdfRag(docId, question, topK);
      }
      throw new Error(`Document ${docId} not found or not analyzed.`);
    }

    const pipe = await getExtractor();
    const output = await pipe(question, { pooling: 'mean', normalize: true });
    const questionEmbedding = Array.from(output.data) as number[];

    const scoredChunks = allChunks.map(chunk => {
      const chunkEmbedding = chunk.embedding as number[];
      return {
        text: chunk.text,
        score: cosineSimilarity(questionEmbedding, chunkEmbedding)
      };
    });

    scoredChunks.sort((a, b) => b.score - a.score);
    const topResults = scoredChunks.slice(0, topK);

    return {
      chunks: topResults.map(r => r.text),
      scores: topResults.map(r => r.score)
    };
  } catch (error: any) {
    log(`[doc-rag] Error querying RAG: ${error.message}`);
    throw error;
  }
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

export async function clearPdfRag(docId: number): Promise<void> {
  if (!db) return;
  try {
    await db.delete(documentChunks).where(eq(documentChunks.docId, docId));
  } catch (error) {
    log(`[doc-rag] Error clearing RAG data: ${(error as any).message}`);
  }
}
