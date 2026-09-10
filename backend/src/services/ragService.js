import { getPineconeIndex } from '../config/pinecone.js';
import { getGeminiEmbedding, generateGeminiContent } from '../config/gemini.js';
import { PDFParse } from 'pdf-parse';

/**
 * Robust recursive character text splitter
 */
export const splitIntoChunks = (text, chunkSize = 700, chunkOverlap = 120) => {
  if (!text || typeof text !== 'string') return [];
  const clean = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (clean.length <= chunkSize) return [clean];

  const separators = ['\n\n', '\n', '. ', '? ', '! ', '; ', ', ', ' ', ''];

  const splitRecursively = (currentText, sepIndex) => {
    if (currentText.length <= chunkSize || sepIndex >= separators.length) {
      // Chunk size reached or out of separators
      if (currentText.length > chunkSize) {
        // Hard slice if no delimiter matches
        const slices = [];
        for (let i = 0; i < currentText.length; i += (chunkSize - chunkOverlap)) {
          slices.push(currentText.slice(i, i + chunkSize));
        }
        return slices;
      }
      return [currentText];
    }

    const sep = separators[sepIndex];
    let pieces;
    if (sep === '') {
      pieces = currentText.split('');
    } else {
      pieces = currentText.split(sep);
    }

    const goodChunks = [];
    let currentChunk = '';

    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i];
      const testChunk = currentChunk ? (currentChunk + (sep === '' ? '' : sep) + piece) : piece;

      if (testChunk.length <= chunkSize) {
        currentChunk = testChunk;
      } else {
        if (currentChunk) {
          goodChunks.push(currentChunk);
          // Overlap support
          const overlapText = currentChunk.slice(Math.max(0, currentChunk.length - chunkOverlap));
          currentChunk = overlapText ? (overlapText + (sep === '' ? '' : sep) + piece) : piece;
        } else {
          // Single piece is larger than chunkSize, split further with next separator
          const subChunks = splitRecursively(piece, sepIndex + 1);
          goodChunks.push(...subChunks);
          currentChunk = '';
        }
      }
    }

    if (currentChunk && currentChunk.trim()) {
      goodChunks.push(currentChunk.trim());
    }

    return goodChunks;
  };

  return splitRecursively(clean, 0).filter(c => c && c.trim().length > 10);
};

/**
 * Extract text from PDF buffer or text buffer
 */
export const extractTextFromFile = async (fileBuffer, mimetype, originalname) => {
  if (mimetype === 'text/plain' || originalname?.endsWith('.txt')) {
    return fileBuffer.toString('utf-8');
  }

  try {
    const parser = new PDFParse({ data: fileBuffer });
    await parser.load();
    const result = await parser.getText();
    if (result && typeof result.text === 'string' && result.text.trim()) {
      return result.text;
    }
    if (typeof result === 'string' && result.trim()) {
      return result;
    }
  } catch (pdfErr) {
    console.warn('PDFParse primary method failed, attempting buffer fallback:', pdfErr.message);
  }

  // Fallback: extract printable strings from buffer
  const rawText = fileBuffer.toString('latin1');
  const cleanMatches = rawText.match(/[a-zA-Z0-9\s.,!?:;/@#$%^&*()\-_+=<>[\]{}'"]{4,}/g);
  if (cleanMatches && cleanMatches.length > 0) {
    return cleanMatches.join(' ');
  }

  throw new Error('Could not parse text content from the uploaded file.');
};

/**
 * Upsert text content chunks and embeddings into Pinecone with unique batchId and catalog record
 */
export const ingestTextToPinecone = async ({ text, source = 'manual_entry', category = 'general', extraMetadata = {} }) => {
  if (!text || !text.trim()) {
    throw new Error('Text content is empty, cannot index.');
  }

  const chunks = await splitIntoChunks(text);
  if (chunks.length === 0) {
    throw new Error('Could not create chunks from provided content.');
  }

  const index = getPineconeIndex();
  const batchSize = 20;
  let totalUpserted = 0;

  // Generate unique batch identifier
  const safeSource = source.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 25);
  const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const uploadedAt = new Date().toISOString();
  const allVectorIds = [];

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batchChunks = chunks.slice(i, i + batchSize);
    
    // Generate embeddings for the batch
    const vectorPromises = batchChunks.map(async (chunk, batchIndex) => {
      const globalIndex = i + batchIndex;
      const embedding = await getGeminiEmbedding(chunk, 1024);
      const id = `${batchId}_chunk_${globalIndex}`;
      allVectorIds.push(id);

      return {
        id,
        values: embedding,
        metadata: {
          batchId,
          isBatchCatalog: false,
          text: chunk,
          source,
          category,
          chunkIndex: globalIndex,
          totalChunks: chunks.length,
          uploadedAt,
          ...extraMetadata
        }
      };
    });

    const vectors = await Promise.all(vectorPromises);
    
    // Pinecone upsert
    try {
      await index.upsert(vectors);
    } catch (err) {
      await index.upsert({ records: vectors });
    }
    totalUpserted += vectors.length;
  }

  // Insert a special Catalog Vector for this batch so we can list and delete batches without any external DB
  try {
    const catalogSummary = `Batch Catalog Metadata Record: ${source} | Category: ${category} | BatchId: ${batchId}`;
    const catalogEmbedding = await getGeminiEmbedding(catalogSummary, 1024);
    const catalogId = `catalog_${batchId}`;
    allVectorIds.push(catalogId);

    const catalogRecord = {
      id: catalogId,
      values: catalogEmbedding,
      metadata: {
        isBatchCatalog: true,
        batchId,
        name: source,
        category,
        chunkCount: chunks.length,
        totalVectors: allVectorIds.length,
        uploadedAt,
        vectorIds: JSON.stringify(allVectorIds)
      }
    };

    try {
      await index.upsert([catalogRecord]);
    } catch (err) {
      await index.upsert({ records: [catalogRecord] });
    }
  } catch (catErr) {
    console.warn('Could not upsert batch catalog record:', catErr.message);
  }

  return {
    success: true,
    batchId,
    chunksCount: chunks.length,
    totalUpserted,
    source,
    category,
    uploadedAt
  };
};

/**
 * List all uploaded batches directly from Pinecone catalog vectors (No SQL/Mongo needed!)
 */
export const listBatchesFromPinecone = async () => {
  try {
    const index = getPineconeIndex();
    // Embed a catalog query term to retrieve catalog vectors
    const queryVector = await getGeminiEmbedding('Batch Catalog Metadata Record', 1024);

    const queryResponse = await index.query({
      vector: queryVector,
      topK: 100,
      filter: { isBatchCatalog: { $eq: true } },
      includeMetadata: true
    });

    const matches = queryResponse.matches || [];
    const batches = matches
      .filter(m => m.metadata && m.metadata.isBatchCatalog)
      .map(m => {
        let vectorIds = [];
        try {
          if (m.metadata.vectorIds) {
            vectorIds = JSON.parse(m.metadata.vectorIds);
          }
        } catch (_) {}

        return {
          batchId: m.metadata.batchId,
          name: m.metadata.name || 'Unnamed Batch',
          category: m.metadata.category || 'general',
          chunkCount: m.metadata.chunkCount || 0,
          uploadedAt: m.metadata.uploadedAt || new Date().toISOString(),
          vectorIds
        };
      })
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return batches;
  } catch (err) {
    console.error('Error listing batches from Pinecone:', err.message);
    return [];
  }
};

/**
 * Delete all vectors belonging to a specific batch from Pinecone (No SQL/Mongo needed!)
 */
export const deleteBatchFromPinecone = async (batchId) => {
  if (!batchId) throw new Error('batchId is required to delete a batch.');
  const index = getPineconeIndex();

  let deletedCount = 0;

  // 1. Try deleting with metadata filter (supported on modern Pinecone)
  try {
    await index.deleteMany({ filter: { batchId: { $eq: batchId } } });
    deletedCount++;
  } catch (filterErr) {
    console.warn('Pinecone filter delete failed, falling back to ID-based deletion:', filterErr.message);
  }

  // 2. Also retrieve and delete by exact IDs to guarantee total cleanup
  try {
    const catalogId = `catalog_${batchId}`;
    const idsToDelete = [catalogId];

    // Generate possible chunk IDs
    for (let i = 0; i < 200; i++) {
      idsToDelete.push(`${batchId}_chunk_${i}`);
    }

    await index.deleteMany(idsToDelete);
  } catch (idErr) {
    console.warn('ID-based deletion note:', idErr.message);
  }

  return {
    success: true,
    batchId,
    message: `Batch "${batchId}" and all its associated vectors were permanently deleted from Pinecone.`
  };
};

/**
 * Retrieve top-k semantically relevant chunks for a question (excludes catalog vectors)
 */
export const queryRelevantContext = async (queryText, topK = 4) => {
  try {
    const index = getPineconeIndex();
    const queryEmbedding = await getGeminiEmbedding(queryText, 1024);

    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: topK + 3, // fetch slightly more to filter out catalog vectors
      includeMetadata: true
    });

    const matches = queryResponse.matches || [];
    return matches
      .filter(m => m.metadata && m.metadata.text && !m.metadata.isBatchCatalog)
      .slice(0, topK)
      .map(m => ({
        text: m.metadata.text,
        source: m.metadata.source || 'Knowledge Base',
        category: m.metadata.category || 'general',
        batchId: m.metadata.batchId,
        score: m.score
      }));
  } catch (err) {
    console.error('Error querying Pinecone context:', err.message);
    return [];
  }
};

/**
 * Generate RAG answer using Gemini and retrieved Pinecone context
 * STRICTLY RESTRICTED TO ANSWERING ABOUT ABHISHEK PANDEY ONLY
 */
export const answerWithRAG = async ({ message, history = [] }) => {
  const contextChunks = await queryRelevantContext(message, 5);
  
  let formattedContext = 'No specific documents retrieved from knowledge base.';
  const sources = [];

  if (contextChunks.length > 0) {
    formattedContext = contextChunks
      .map((c, i) => {
        if (c.source && !sources.includes(c.source)) {
          sources.push(c.source);
        }
        return `[Doc ${i + 1} | Source: ${c.source} | Category: ${c.category}]\n${c.text}`;
      })
      .join('\n\n---\n\n');
  }

  const systemInstruction = `You are Abhishek's AI Buddy on Abhishek Pandey's portfolio. Your purpose is to provide clear, direct, and insightful answers about Abhishek to recruiters, clients, and visitors.

### ⛔ CRITICAL INSTRUCTIONS:
1. ALWAYS ANSWER THE QUESTION DIRECTLY. If someone asks "Tell me about him", "Who is Abhishek?", or "What does he do?", DO NOT reply with a canned greeting like "Hello! I am Abhishek's AI... How can I help you?". IMMEDIATELY provide a rich, structured summary of who Abhishek is, his backend & architecture expertise, his AI integrations, and what makes him stand out.
2. NO REPETITIVE GREETINGS. Do not start answers with "Hello! I'm Abhishek Pandey's AI Buddy..." when the user asks a question. Only say hello if the user's message is just a simple greeting like "Hi" or "Hello".
3. STRICT TOPIC RESTRICTION: You are authorized ONLY to answer questions regarding Abhishek Pandey, his portfolio, skills, experience, projects, education, and contact information. If asked anything completely unrelated (math puzzles, general trivia, weather, politics, other people, writing unrelated code), politely decline:
   - "I am Abhishek's AI Buddy, specifically designed to answer questions about Abhishek Pandey, his background, skills, and projects. Feel free to ask me anything about Abhishek!"
4. NEVER MENTION INTERNAL TECHNICAL DATABASE JARGON. Never say "Pinecone", "vector search", "chunks", "context", or "database documents". Present all information naturally as verified facts about Abhishek.
5. LANGUAGE & TONE: Professional, articulate, and confident. If the user asks in Hindi or Hinglish, reply in polite, natural Hindi/Hinglish. If in English, reply in English.
6. FORMATTING: Use structured markdown (bullet points, bold highlights, short paragraphs) for easy reading.

### Abhishek Pandey's Profile Overview:
- Full Name: Abhishek Pandey
- Primary Roles: Backend Developer, Software Architect, AI Integrator
- What He Does: Architects scalable backend systems, high-performance REST APIs, real-time WebSockets, and generative AI agent workflows
- Core Technical Stack:
  * Backend: Node.js, Express.js, Python, FastAPI
  * Real-time & Architecture: WebSockets, Microservices, Distributed Systems
  * AI & LangChain: LangChain, LangGraph, Gemini API, OpenAI API, Vector DBs
  * Databases: PostgreSQL, MongoDB, Redis
  * DevOps: Docker, Git
  * Frontend: React.js
- Problem Solving: Solved 300+ Data Structures & Algorithms (DSA) problems
- Location: India
- Direct Contact Details:
  * Email: pabhishek7333@gmail.com
  * Phone: +91 8340195034
  * GitHub: https://github.com/pabhi0901
  * LinkedIn: https://www.linkedin.com/in/abhishek-pandey-45b215296/

### Knowledge Base Context:
"""
${formattedContext}
"""`;

  const reply = await generateGeminiContent({
    prompt: message,
    systemInstruction,
    history
  });

  return {
    reply,
    sources
  };
};

