import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Lazy connection - don't block startup
// Connection will happen on first query
let connectionAttempted = false;

const connectToDatabase = async () => {
  if (connectionAttempted) return;
  connectionAttempted = true;
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    // Don't exit - allow server to start and retry on first query
    console.warn('⚠️ Server will start, but database queries may fail');
  }
};

// Connect in background (non-blocking)
connectToDatabase().catch(() => {
  // Connection failed, but don't crash
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
