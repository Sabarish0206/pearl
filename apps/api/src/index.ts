import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { prisma } from '@pearl/database';
import { env } from './config/env';
import healthRouter from './modules/health/health.router';
import authRouter from './modules/auth/auth.router';
import resumeRouter from './modules/resume/resume.router';
import jobRouter from './modules/job/job.router';
import studentAdminRouter from './modules/student/student.admin.router';
import studentUserRouter from './modules/student/student.user.router';
import { requestLogger } from './middleware/logger.middleware';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const PORT = env.PORT;

// Middleware
app.use(requestLogger);
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());


// Register Modules
app.use('/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/student/resume', resumeRouter);
app.use('/api/admin/jobs', jobRouter);
app.use('/api/admin/students', studentAdminRouter);
// TODO: placeholder route — no implementation yet; URL path subject to change
app.use('/api/student/profile', studentUserRouter);


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