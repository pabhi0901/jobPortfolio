import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { getIndexStats } from './config/pinecone.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for Render / Vercel reverse proxies
app.set('trust proxy', 1);

// Rate Limiter: 10 requests per minute from an IP
// Excludes keep-alive ping endpoints so pings never get blocked
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => req.path === '/ping' || req.path === '/api/ping' || req.path === '/',
  message: {
    error: 'Too many requests from this IP. Please wait a minute before trying again.'
  }
});

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// -------------------------------------------------------------
// KEEP-ALIVE PING ENDPOINTS (Auth-Free, Anti-Sleep for Render)
// Bots / Uptime monitors can call this every few minutes
// -------------------------------------------------------------
const pingHandler = (req, res) => {
  res.json({
    status: 'awake',
    message: 'Portfolio server is active and running',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    service: 'Abhishek Portfolio Backend'
  });
};

app.get('/ping', pingHandler);
app.get('/api/ping', pingHandler);

// Root greeting & status endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Abhishek Portfolio Backend API',
    version: '1.0.0',
    pingUrl: '/ping',
    chatEndpoint: '/api/chat',
    timestamp: new Date().toISOString()
  });
});

// Apply rate limiter to all API endpoints
app.use('/api', limiter);

// Health Check
app.get('/api/health', async (req, res) => {
  const stats = await getIndexStats();
  res.json({
    status: 'ok',
    service: 'Abhishek Portfolio Backend',
    timestamp: new Date().toISOString(),
    pinecone: stats
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Portfolio Backend running on http://0.0.0.0:${PORT}`);
  console.log(`AI Chat endpoint: POST http://localhost:${PORT}/api/chat`);
  console.log(`Admin routes: /api/admin/* (Protected by JWT)`);
  console.log(`Gemini Model: ${process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite'}`);
});
