import { Router } from 'express';
import { answerWithRAG } from '../services/ragService.js';

const router = Router();

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const result = await answerWithRAG({
      message: message.trim(),
      history: Array.isArray(history) ? history : []
    });

    return res.json({
      success: true,
      reply: result.reply,
      sources: result.sources
    });
  } catch (err) {
    console.error('Error in /api/chat route:', err);
    return res.status(500).json({
      error: 'An error occurred while generating an answer: ' + err.message
    });
  }
});

export default router;
