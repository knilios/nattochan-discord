const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'List all available commands or get info about a specific command',
  aliases: ['commands', 'h'],
  usage: '[command name]',
  args: false,
  cooldown: 5,
  
  async execute(message, args, client) {
    const { prefix } = client.config.discord;
    const { commands } = client;

    if (!args.length) {
      // Display all commands
      const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('📚 Available Commands')
        .setDescription(`Use \`${prefix}help [command]\` for detailed information about a command.`)
        .setFooter(`Prefix: ${prefix}`)
        .setTimestamp();

      const commandList = commands.map(cmd => `\`${cmd.name}\``).join(', ');
      embed.addField('Commands', commandList || 'No commands available');

      return message.channel.send(embed);
    }

    // Display specific command info
    const name = args[0].toLowerCase();
    const command = commands.get(name) || 
                   commands.find(c => c.aliases && c.aliases.includes(name));

    if (!command) {
      return message.reply('That\'s not a valid command!');
    }

    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`Command: ${command.name}`)
      .setDescription(command.description || 'No description available');

    if (command.aliases && command.aliases.length) {
      embed.addField('Aliases', command.aliases.join(', '), true);
    }

    if (command.usage) {
      embed.addField('Usage', `\`${prefix}${command.name} ${command.usage}\``, true);
    }

    if (command.cooldown) {
      embed.addField('Cooldown', `${command.cooldown} seconds`, true);
    }

    return message.channel.send(embed);
  },
};
