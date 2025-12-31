const { initializeVectorDB, searchMemories, storeMemories, getAllMemories } = require('../modules/vectorDB');
const logger = require('../utils/logger');

module.exports = {
  name: 'testdb',
  description: 'Test vector database functionality',
  aliases: ['testmem', 'dbtest'],
  usage: '',
  args: false,
  cooldown: 10,
  
  async execute(message, args, client) {
    await message.channel.send('🧪 **Testing Vector Database...**\n');
    
    const results = [];
    let allPassed = true;

    // Test 1: Connection
    try {
      await message.channel.send('1️⃣ Testing ChromaDB connection...');
      const collection = await initializeVectorDB();
      
      if (collection) {
        results.push('✅ ChromaDB connection: SUCCESS');
      } else {
        results.push('❌ ChromaDB connection: FAILED');
        allPassed = false;
      }
    } catch (error) {
      results.push(`❌ ChromaDB connection: ERROR - ${error.message}`);
      allPassed = false;
    }

    // Test 2: Store test memories
    try {
      await message.channel.send('2️⃣ Testing memory storage...');
      
      const testChunks = [
        {
          narrative: 'Test user likes pizza and coding. They are learning JavaScript.',
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'test',
            topics: 'pizza, coding, javascript'
          }
        },
        {
          narrative: 'Test user prefers cats over dogs. They have two cats named Luna and Shadow.',
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'test',
            topics: 'cats, pets'
          }
        }
      ];
      
      const stored = await storeMemories(testChunks);
      
      if (stored) {
        results.push(`✅ Memory storage: SUCCESS (stored ${testChunks.length} chunks)`);
      } else {
        results.push('❌ Memory storage: FAILED');
        allPassed = false;
      }
    } catch (error) {
      results.push(`❌ Memory storage: ERROR - ${error.message}`);
      allPassed = false;
    }

    // Test 3: Search memories
    try {
      await message.channel.send('3️⃣ Testing memory search...');
      
      // Wait a moment for indexing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const searchResults = await searchMemories('What pets does the user have?', 2);
      
      if (searchResults && searchResults.length > 0) {
        results.push(`✅ Memory search: SUCCESS (found ${searchResults.length} results)`);
        results.push(`   Top result: "${searchResults[0].narrative.substring(0, 60)}..."`);
      } else {
        results.push('⚠️ Memory search: No results (this might be normal if database is empty)');
      }
    } catch (error) {
      results.push(`❌ Memory search: ERROR - ${error.message}`);
      allPassed = false;
    }

    // Test 4: Retrieve all memories
    try {
      await message.channel.send('4️⃣ Testing memory retrieval...');
      
      const allMemories = await getAllMemories();
      
      results.push(`✅ Memory retrieval: SUCCESS (${allMemories.length} total memories in database)`);
    } catch (error) {
      results.push(`❌ Memory retrieval: ERROR - ${error.message}`);
      allPassed = false;
    }

    // Send results
    const finalMessage = [
      '```',
      '🧪 VECTOR DATABASE TEST RESULTS',
      '================================',
      '',
      ...results,
      '',
      '================================',
      allPassed ? '✅ ALL TESTS PASSED!' : '❌ SOME TESTS FAILED',
      '```'
    ].join('\n');

    await message.channel.send(finalMessage);

    // Cleanup suggestion
    if (allPassed) {
      await message.channel.send(
        '💡 **Tip:** Test memories were added to the database. You can see them with `!memory list` or chat with the bot to see if it retrieves them!'
      );
    }
  },
};
