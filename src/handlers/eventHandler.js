const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

/**
 * Load all event handlers from the events directory
 * @param {Client} client - Discord.js client instance
 */
async function loadEvents(client) {
  const eventsPath = path.join(__dirname, '../events');
  
  try {
    const eventFiles = await fs.readdir(eventsPath);
    const jsFiles = eventFiles.filter(file => file.endsWith('.js'));

    for (const file of jsFiles) {
      const filePath = path.join(eventsPath, file);
      const event = require(filePath);

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }

      logger.info(`Loaded event: ${event.name}`);
    }

    logger.success(`Successfully loaded ${jsFiles.length} events`);
  } catch (error) {
    logger.error('Error loading events:', error);
  }
}

module.exports = { loadEvents };
