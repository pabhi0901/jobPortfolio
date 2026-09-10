import dotenv from 'dotenv';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
const EMBEDDING_MODEL = 'gemini-embedding-001';

/**
 * Generate embedding vector using Gemini API with exact target dimension (e.g. 1024)
 */
export const getGeminiEmbedding = async (text, dimension = 1024) => {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${GEMINI_API_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: { parts: [{ text }] },
      outputDimensionality: dimension
    })
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`Gemini Embedding Error: ${data.error.message || JSON.stringify(data.error)}`);
  }

  if (!data.embedding || !data.embedding.values) {
    throw new Error('Invalid embedding response received from Gemini');
  }

  return data.embedding.values;
};

/**
 * Generate text response with Gemini 2.5 Flash Lite
 */
export const generateGeminiContent = async ({ prompt, systemInstruction = '', history = [] }) => {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables');
  }

  const modelsToTry = [GEMINI_MODEL, 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      
      const contents = [];

      // Add conversation history if provided
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-8)) { // Last 8 messages for context
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.content || item.text || '' }]
          });
        }
      }

      // Add current user prompt
      contents.push({
        role: 'user',
        parts: [{ text: prompt }]
      });

      const requestBody = {
        contents,
        generationConfig: {
          temperature: 0.4,
          topP: 0.95,
          maxOutputTokens: 1024
        }
      };

      if (systemInstruction) {
        requestBody.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      if (data.error) {
        lastError = new Error(`Gemini Error (${model}): ${data.error.message}`);
        continue; // try fallback model
      }

      const candidate = data.candidates?.[0];
      const text = candidate?.content?.parts?.map(p => p.text).join('') || '';
      return text;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to generate response from Gemini');
};

/**
 * LangChain ChatGoogleGenerativeAI instance for LangChain chains
 */
export const getLangchainChatModel = () => {
  return new ChatGoogleGenerativeAI({
    apiKey: GEMINI_API_KEY,
    model: GEMINI_MODEL,
    temperature: 0.4
  });
};
