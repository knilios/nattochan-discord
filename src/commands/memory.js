const { manualProcess, getSummariesCount } = require('../utils/scheduler');
const { getConversationState } = require('../modules/aiChat');
const { getAllMemories } = require('../modules/vectorDB');

module.exports = {
  name: 'memory',
  description: 'Memory management and debugging commands',
  aliases: ['mem', 'memories'],
  usage: '[process|stats|list]',
  args: false,
  cooldown: 5,
  ownerOnly: true, // You might want to restrict this
  
  async execute(message, args, client) {
    const subcommand = args[0]?.toLowerCase();

    switch (subcommand) {
      case 'process':
        await message.channel.send('⏳ Processing summaries into vector database...');
        try {
          await manualProcess();
          await message.channel.send('✅ Memory processing complete!');
        } catch (error) {
          await message.channel.send(`❌ Error: ${error.message}`);
        }
        break;

      case 'stats':
        const convState = getConversationState();
        const summariesCount = getSummariesCount();
        const memories = await getAllMemories();
        
        const stats = [
          '📊 **Memory Statistics**',
          ``,
          `**Current Session:**`,
          `- Conversation cache: ${convState.cacheLength} messages`,
          `- Has rolling summary: ${convState.hasSummary ? 'Yes' : 'No'}`,
          ``,
          `**Pending Processing:**`,
          `- Daily summaries: ${summariesCount}`,
          ``,
          `**Vector Database:**`,
          `- Stored memories: ${memories.length} chunks`,
        ];
        
        await message.channel.send(stats.join('\n'));
        break;

      case 'list':
        const allMemories = await getAllMemories();
        
        if (allMemories.length === 0) {
          await message.channel.send('No memories stored yet.');
          return;
        }

        const memoryList = allMemories.slice(0, 5).map((mem, idx) => {
          const preview = mem.narrative.substring(0, 100);
          return `${idx + 1}. ${preview}${mem.narrative.length > 100 ? '...' : ''}`;
        });

        await message.channel.send([
          `**Stored Memories (${allMemories.length} total, showing first 5):**`,
          '',
          ...memoryList
        ].join('\n'));
        break;

      default:
        await message.channel.send([
          '**Memory Commands:**',
          '`!memory process` - Manually process summaries into vector DB',
          '`!memory stats` - Show memory statistics',
          '`!memory list` - List stored memories (first 5)',
        ].join('\n'));
    }
  },
};
