import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
dotenv.config();

let pineconeClient = null;
let pineconeIndex = null;

export const getPineconeClient = () => {
  if (!pineconeClient) {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
      throw new Error('PINECONE_API_KEY is not defined in environment variables');
    }
    pineconeClient = new Pinecone({ apiKey });
  }
  return pineconeClient;
};

export const getPineconeIndex = () => {
  if (!pineconeIndex) {
    const client = getPineconeClient();
    const indexName = process.env.PINECONE_INDEX || 'portfolio';
    pineconeIndex = client.index(indexName);
  }
  return pineconeIndex;
};

export const getIndexStats = async () => {
  try {
    const index = getPineconeIndex();
    const stats = await index.describeIndexStats();
    return {
      connected: true,
      indexName: process.env.PINECONE_INDEX || 'portfolio',
      dimension: stats.dimension || 1024,
      totalRecordCount: stats.totalRecordCount ?? 0,
      namespaces: stats.namespaces || {}
    };
  } catch (error) {
    return {
      connected: false,
      indexName: process.env.PINECONE_INDEX || 'portfolio',
      error: error.message
    };
  }
};
