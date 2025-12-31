const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

/**
 * Load all commands from the commands directory
 * @param {Client} client - Discord.js client instance
 */
async function loadCommands(client) {
  const commandsPath = path.join(__dirname, '../commands');
  
  try {
    const commandFiles = await fs.readdir(commandsPath);
    const jsFiles = commandFiles.filter(file => file.endsWith('.js'));

    for (const file of jsFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);

      // Validate command structure
      if (!command.name) {
        logger.warn(`Command at ${file} is missing a name property`);
        continue;
      }

      if (!command.execute) {
        logger.warn(`Command ${command.name} is missing an execute function`);
        continue;
      }

      // Set command in collection
      client.commands.set(command.name, command);
      logger.info(`Loaded command: ${command.name}`);
    }

    logger.success(`Successfully loaded ${client.commands.size} commands`);
  } catch (error) {
    logger.error('Error loading commands:', error);
  }
}

module.exports = { loadCommands };
