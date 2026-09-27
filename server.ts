import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

// Config and seeder
import { seedDatabase } from './server/config/seed.js';
import { setupSocketHandlers } from './server/sockets/interviewSocket.js';

// Route modules
import authRoutes from './server/routes/authRoutes.js';
import interviewRoutes from './server/routes/interviewRoutes.js';
import questionRoutes from './server/routes/questionRoutes.js';
import problemRoutes from './server/routes/problemRoutes.js';
import submissionRoutes from './server/routes/submissionRoutes.js';
import userRoutes from './server/routes/userRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Socket.IO configuration with CORS enabled for seamless local/tunnel connectivity
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

setupSocketHandlers(io);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/users', userRoutes);

// Centralized API error handling
app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Error Handler]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'An internal server error occurred.',
  });
});

// Vite integration: Dev middleware vs Static dist
async function startServer() {
  await seedDatabase();

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Vite] Mounted dev middleware mode.');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('[Express] Serving static assets from dist.');
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Intervexa] Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Startup Failure]:', err);
  process.exit(1);
});
