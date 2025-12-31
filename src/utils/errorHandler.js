const logger = require('./logger');

/**
 * Global error handlers for the process
 */
function setupErrorHandlers() {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    // In production, you might want to restart the bot
    if (process.env.NODE_ENV === 'production') {
      logger.error('Exiting due to uncaught exception');
      process.exit(1);
    }
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  // Handle warnings
  process.on('warning', (warning) => {
    logger.warn('Process warning:', warning);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    process.exit(0);
  });
}

module.exports = { setupErrorHandlers };
