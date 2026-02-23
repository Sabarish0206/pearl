import express from 'express';
import cors from 'cors';
import { prisma } from '@pearl/database';
import { env } from './config/env';
import healthRouter from './modules/health/health.router';
import { requestLogger } from './middleware/logger.middleware';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const PORT = env.PORT;

// Middleware
app.use(requestLogger);
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());


// Register Modules
app.use('/health', healthRouter);


// Error Handling Middleware
app.use(errorHandler);


async function startServer() {
  try {
    // Attempt to connect to the database
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Pearl API is shining at: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to the database. Exiting...', error);
    process.exit(1);
  }
}

startServer();