import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import authRoutes from './routes/auth.routes';
import organizationRoutes from './routes/organization.routes';
import proposalRoutes from './routes/proposal.routes';
import uploadRoutes from './routes/upload.routes';
import notificationRoutes from './routes/notification.routes';
import documentRoutes from './routes/document.routes';
import sharingRoutes from './routes/sharing.routes';
import connectionRoutes from './routes/connection.routes';
import versionRoutes from './routes/version.routes';
import signatureRoutes from './routes/signature.routes';
import templateRoutes from './routes/template.routes';
import contractRoutes from './routes/contract.routes';
import reminderRoutes from './routes/reminder.routes';
import messageRoutes from './routes/message.routes';
import auditRoutes from './routes/audit.routes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8080;

// Trust proxy (needed for Railway, Vercel, and other platforms behind a proxy)
app.set('trust proxy', 1);

// Security middleware - configured for CORS compatibility
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000'];

console.log('🌐 Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', documentRoutes); // Handles /api/documents and /api/proposals/:id/documents
app.use('/api/sharing', sharingRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api', versionRoutes); // Handles /api/proposals/:id/versions
app.use('/api', signatureRoutes); // Handles /api/signature-requests and /api/sign
app.use('/api/templates', templateRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/audit-logs', auditRoutes);

// Serve frontend static files in production
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// Handle React Router - send all non-API requests to index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
