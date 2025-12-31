module.exports = {
  name: 'こんにちは',
  description: '「こんにちは」という挨拶 (Japanese greeting)',
  aliases: ['konnichiwa', 'hello-jp'],
  usage: '',
  args: false,
  cooldown: 3,
  
  async execute(message, args, client) {
    await message.channel.send('죄송합니다. 일본어를 할 수 없습니다');
  },
};
