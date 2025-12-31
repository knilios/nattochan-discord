const logger = require('../utils/logger');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    logger.success(`Logged in as ${client.user.tag}!`);
    
    // Set random activity
    const activities = client.config.bot.activities;
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    
    client.user.setActivity(randomActivity);
    logger.info(`Status set to: ${randomActivity}`);
    
    // Store current activity globally
    client.currentActivity = randomActivity;
    
    // Log bot information
    logger.info(`Serving ${client.guilds.cache.size} servers`);
  },
};
