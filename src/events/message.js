const logger = require('../utils/logger');
const { handleAIChat } = require('../modules/aiChat');

module.exports = {
  name: 'message',
  async execute(message, client) {
    // Ignore bot messages
    if (message.author.bot) return;

    const { prefix, clientId } = client.config.discord;
    
    // Check if bot is mentioned for AI chat
    const mentionRegex = new RegExp(`^<@!?${clientId}>`);
    if (message.content.match(mentionRegex)) {
      try {
        console.log("Calling AI")
        await handleAIChat(message, client);
      } catch (error) {
        logger.error('Error in AI chat:', error);
        await message.channel.send('Sorry, I encountered an error processing your message.');
      }
      return;
    }

    // Check if message starts with prefix
    if (!message.content.startsWith(prefix)) return;

    // Parse command and arguments
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Get command
    const command = client.commands.get(commandName) || 
                   client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) {
      return message.channel.send('ไม่เจอคำสั่งนั้น (Command not found)');
    }

    // Check if command requires arguments
    if (command.args && !args.length) {
      let reply = `You didn't provide any arguments, ${message.author}!`;
      
      if (command.usage) {
        reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
      }
      
      return message.channel.send(reply);
    }

    // Execute command
    try {
      await command.execute(message, args, client);
      logger.info(`${message.author.tag} executed command: ${commandName}`);
    } catch (error) {
      logger.error(`Error executing command ${commandName}:`, error);
      await message.reply('There was an error trying to execute that command!');
    }
  },
};
