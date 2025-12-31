const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'info',
  description: 'Display information about the bot',
  aliases: ['botinfo', 'about'],
  usage: '',
  args: false,
  cooldown: 10,
  
  async execute(message, args, client) {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor(uptime / 3600) % 24;
    const minutes = Math.floor(uptime / 60) % 60;
    const seconds = Math.floor(uptime % 60);
    
    const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    
    const embed = new MessageEmbed()
      .setColor('#FF69B4')
      .setTitle('🤖 Nattochan Bot Information')
      .setThumbnail(client.user.displayAvatarURL())
      .addField('Bot Name', client.user.tag, true)
      .addField('Bot ID', client.user.id, true)
      .addField('Servers', client.guilds.cache.size.toString(), true)
      .addField('Users', client.users.cache.size.toString(), true)
      .addField('Channels', client.channels.cache.size.toString(), true)
      .addField('Uptime', uptimeString, true)
      .addField('Node.js Version', process.version, true)
      .addField('Discord.js Version', require('discord.js').version, true)
      .addField('Prefix', client.config.discord.prefix, true)
      .addField('Current Activity', client.currentActivity || 'None', false)
      .setFooter(`Created by ${client.config.author || 'knilios'}`)
      .setTimestamp();

    await message.channel.send(embed);
  },
};
