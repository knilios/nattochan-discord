/**
 * Command Template
 * Copy this file to create new commands
 */

module.exports = {
  // Command name (required) - used to execute the command
  name: 'template',
  
  // Command description (required) - shown in help command
  description: 'A template for creating new commands',
  
  // Alternative names for this command (optional)
  aliases: ['temp', 'example'],
  
  // Usage information (optional) - shown in help command
  // Use <> for required args, [] for optional args
  usage: '<required_arg> [optional_arg]',
  
  // Whether this command requires arguments (optional, default: false)
  args: false,
  
  // Cooldown in seconds (optional, default: 3)
  cooldown: 5,
  
  // Whether this command can only be used by the bot owner (optional)
  ownerOnly: false,
  
  // Whether this command can only be used in guilds (optional)
  guildOnly: false,
  
  // Required permissions for the user (optional)
  // Examples: 'ADMINISTRATOR', 'MANAGE_MESSAGES', 'KICK_MEMBERS'
  userPermissions: [],
  
  // Required permissions for the bot (optional)
  botPermissions: [],
  
  /**
   * Execute the command
   * @param {Message} message - The message that triggered this command
   * @param {Array<string>} args - Arguments passed with the command
   * @param {Client} client - The Discord client instance
   */
  async execute(message, args, client) {
    try {
      // Your command logic here
      
      // Access config if needed
      // const config = client.config;
      
      // Send a response
      await message.channel.send('This is a template command!');
      
    } catch (error) {
      console.error('Error executing template command:', error);
      await message.reply('An error occurred while executing this command.');
    }
  },
};
