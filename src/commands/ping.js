module.exports = {
  name: 'ping',
  description: 'Check the bot\'s latency',
  aliases: ['latency', 'pong'],
  usage: '',
  args: false,
  cooldown: 3,
  
  async execute(message, args, client) {
    const sent = await message.channel.send('Pinging...');
    const latency = sent.createdTimestamp - message.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);
    
    await sent.edit(`🏓 Pong!\nLatency: ${latency}ms\nAPI Latency: ${apiLatency}ms`);
  },
};
