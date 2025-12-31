const { Client, Collection } = require('discord.js');
const config = require('./src/config/config');
const { loadCommands } = require('./src/handlers/commandHandler');
const { loadEvents } = require('./src/handlers/eventHandler');
const { setupErrorHandlers } = require('./src/utils/errorHandler');
const { setupScheduler } = require('./src/utils/scheduler');
const { initializeVectorDB } = require('./src/modules/vectorDB');
const logger = require('./src/utils/logger');

// Setup global error handlers
setupErrorHandlers();

// Initialize Discord client
const client = new Client();

// Set up client properties
client.commands = new Collection();
client.config = config;

// Load commands and events
(async () => {
  try {
    await loadCommands(client);
    await loadEvents(client);
    
    // Initialize Vector Database
    logger.info('Initializing Vector Database...');
    await initializeVectorDB();
    
    // Setup scheduler for daily memory processing
    logger.info('Setting up memory scheduler...');
    setupScheduler(client);
    
    // Login to Discord
    await client.login(config.discord.token);
  } catch (error) {
    logger.error('Failed to start the bot:', error);
    process.exit(1);
  }
})();
