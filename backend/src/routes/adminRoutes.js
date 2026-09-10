import { Router } from 'express';
import multer from 'multer';
import { verifyAdminToken } from '../middleware/auth.js';
import { extractTextFromFile, ingestTextToPinecone, listBatchesFromPinecone, deleteBatchFromPinecone } from '../services/ragService.js';
import { getIndexStats, getPineconeIndex } from '../config/pinecone.js';

const router = Router();

// Memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// All routes in this router require Admin JWT
router.use(verifyAdminToken);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await getIndexStats();
    return res.json(stats);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/upload-resume
router.post('/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please upload a PDF or TXT file.' });
    }

    const { buffer, mimetype, originalname } = req.file;

    // Extract text from uploaded document
    const extractedText = await extractTextFromFile(buffer, mimetype, originalname);
    if (!extractedText || extractedText.trim().length < 20) {
      return res.status(400).json({
        error: 'Extracted text is too short or file could not be read cleanly.'
      });
    }

    // Chunk and upsert to Pinecone
    const result = await ingestTextToPinecone({
      text: extractedText,
      source: `resume_${originalname}`,
      category: 'resume',
      extraMetadata: {
        filename: originalname,
        uploadedAt: new Date().toISOString()
      }
    });

    return res.json({
      success: true,
      message: `Resume "${originalname}" successfully chunked and vectorized to Pinecone!`,
      chunksCount: result.chunksCount,
      totalUpserted: result.totalUpserted
    });
  } catch (err) {
    console.error('Error uploading resume:', err);
    return res.status(500).json({
      error: 'Failed to process and index resume: ' + err.message
    });
  }
});

// POST /api/admin/add-text
router.post('/add-text', async (req, res) => {
  try {
    const { title, category, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content field is required' });
    }

    const cleanTitle = title?.trim() || 'Custom Details';
    const cleanCategory = category?.trim() || 'general';

    // Chunk and upsert to Pinecone
    const result = await ingestTextToPinecone({
      text: content,
      source: cleanTitle,
      category: cleanCategory,
      extraMetadata: {
        title: cleanTitle,
        uploadedAt: new Date().toISOString()
      }
    });

    return res.json({
      success: true,
      message: `"${cleanTitle}" successfully chunked and vectorized to Pinecone!`,
      chunksCount: result.chunksCount,
      totalUpserted: result.totalUpserted
    });
  } catch (err) {
    console.error('Error adding text details:', err);
    return res.status(500).json({
      error: 'Failed to index details: ' + err.message
    });
  }
});

// GET /api/admin/batches (List uploaded knowledge batches from Pinecone)
router.get('/batches', async (req, res) => {
  try {
    const batches = await listBatchesFromPinecone();
    return res.json({
      success: true,
      batches
    });
  } catch (err) {
    console.error('Error fetching batches from Pinecone:', err);
    return res.status(500).json({ error: 'Failed to list batches: ' + err.message });
  }
});

// DELETE /api/admin/batch/:batchId (Delete specific batch and all its vectors)
router.delete('/batch/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    if (!batchId) {
      return res.status(400).json({ error: 'batchId parameter is required' });
    }

    const result = await deleteBatchFromPinecone(batchId);
    return res.json(result);
  } catch (err) {
    console.error('Error deleting batch from Pinecone:', err);
    return res.status(500).json({ error: 'Failed to delete batch: ' + err.message });
  }
});

export default router;
