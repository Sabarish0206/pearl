export const logger = {
  info: (message: string) => {
    console.log(`💡 [INFO] ${new Date().toISOString()}: ${message}`);
  },
  
  warn: (message: string) => {
    console.warn(`⚠️ [WARN] ${new Date().toISOString()}: ${message}`);
  },

  error: (message: string, error?: any) => {
    console.error(`🔴 [ERROR] ${new Date().toISOString()}: ${message}`);
    if (error) console.error(error); // Logs the stack trace if provided
  },

  http: (method: string, url: string, status: number, duration: number) => {
    const emoji = status >= 500 ? '💥' : status >= 400 ? '❌' : '✅';
    console.log(`${emoji} [${method}] ${url} - ${status} (${duration}ms)`);
  }
};