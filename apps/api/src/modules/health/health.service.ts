export const getHealthStatus = () => {
  return {
    status: 'ok',
    message: 'Pearl API is shining and ready! 🚀',
    timestamp: new Date().toISOString(),
    service: 'Pearl API'
  };
};