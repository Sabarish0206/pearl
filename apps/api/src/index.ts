import express, { Request, Response } from 'express';
import cors from 'cors';
import healthRouter from './modules/health/health.router.js';
import { requestLogger } from './middleware/logger.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(requestLogger);
app.use(cors());
app.use(express.json());


// Register Modules
app.use('/health', healthRouter);


// Error Handling Middleware
app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`\n🚀 Pearl API is shining at: http://localhost:${PORT}`);
});