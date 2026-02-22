import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());


app.listen(PORT, () => {
  console.log(`\n🚀 Pearl API is shining at: http://localhost:${PORT}`);
});