import 'dotenv/config'; // Loads your .env variables (PORT, AWS, Gemini)
import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 S3 Bucket: ${process.env.AWS_RESUME_BUCKET}`);
  console.log(`🤖 AI Studio Ready`);
});