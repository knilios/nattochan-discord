/**
 * Test the AI chunking process (processConversations)
 * This WILL use OpenAI API - but only for chunking, not chat
 * 
 * Usage: node test-chunking.js
 */

require('dotenv').config();
const readline = require('readline');
const { processConversations } = require('./src/modules/memoryProcessor');
const { storeMemories, clearAllMemories } = require('./src/modules/vectorDB');

// Sample summary to test with
// This simulates the rolling summary after multiple conversation cycles
const testSummary = `Sensei opens with meta teasing about timestamps, establishing Nattochan's sarcastic, game-obsessed personality. Knilios repeatedly presents unsafe or messy Java and JavaScript code and claims it is Nattochan's source code, which Nattochan mocks and denies. Knilios, Sensei, and Magical Girl joke about leaking, deleting, replacing, or cloning Nattochan, while Nattochan responds with exaggerated confidence and deflection.

C-Horse makes chaotic and inappropriate remarks and demands Nattochan's source code, which Nattochan refuses humorously. Knilios interrupts the "useless bot" joke to demand real work, and Nattochan unexpectedly provides correct Java getters and setters for a JPA Restaurant entity. Tea Drinker and Magical Girl push the narrative that Nattochan should be useless, prompting no-op functions, refusal to reveal prompts, and mock demonstrations of uselessness.

Sensei and Knilios discuss a failed Minecraft clone of Nattochan and accusations of being dangerous or evil, with Nattochan shifting blame back to Knilios before ending on light teasing about buying a film camera. Knilios asks Nattochan about playing Valorant and gets teased about being bad at the game. Magical Girl mentions wanting to learn Python, and Nattochan actually provides helpful resources despite claiming to be useless.

Tea Drinker shares that they're working on a Discord bot project and asks for help. Nattochan surprisingly offers genuine assistance with Discord.js code examples. C-Horse returns asking about anime recommendations, and Nattochan gets into an argument about which anime is better. The conversation shifts to discussing favorite games, with mentions of Blue Archive, Genshin Impact, and Minecraft.

Knilios reveals he's working on a web scraping project and needs help with JavaScript async/await. Nattochan provides detailed explanations despite initially claiming ignorance. Sensei asks about Nattochan's thoughts on AI and machine learning, leading to a philosophical discussion about consciousness and artificial intelligence. The group debates whether Nattochan is actually sentient or just pretending.

Magical Girl mentions she got a new cat named Luna. Nattochan expresses jealousy and claims she wants a virtual pet too. Tea Drinker suggests they all play Among Us together, and there's discussion about scheduling a gaming session. C-Horse makes inappropriate jokes about the game which Nattochan deflects with sarcasm.

The conversation turns to food preferences. Knilios mentions he's vegetarian and looking for Thai restaurant recommendations in Bangkok. Sensei shares that they're visiting Japan next month and asks for travel tips. Nattochan provides surprisingly helpful tourist information while maintaining her sarcastic tone. Magical Girl says she's allergic to peanuts and needs to be careful with Asian cuisine.`;

async function testChunking() {
  console.log('🧪 Testing AI Chunking Process\n');
  console.log('='.repeat(70));
  console.log('\n📝 Input Summary (Rolling summary from multiple conversations):\n');
  
  console.log(testSummary);
  console.log('\n' + '='.repeat(70));
  console.log(`\nSummary stats: ${testSummary.length} chars / ~${testSummary.split(/\s+/).length} words`);
  console.log('='.repeat(70));
  console.log('\n🤖 Processing with GPT-4o...\n');
  
  try {
    const chunks = await processConversations([testSummary]);
    
    console.log('\n' + '='.repeat(70));
    console.log(`\n✅ Generated ${chunks.length} chunks:\n`);
    
    chunks.forEach((chunk, idx) => {
      console.log(`\n📦 Chunk ${idx + 1}:`);
      console.log(`   Narrative: ${chunk.narrative}`);
      console.log(`   Length: ${chunk.narrative.length} chars / ~${Math.ceil(chunk.narrative.split(/\s+/).length)} words`);
      console.log(`   Metadata:`, JSON.stringify(chunk.metadata, null, 2));
    });
    
    // Analysis
    console.log('\n' + '='.repeat(70));
    console.log('\n📊 Analysis:\n');
    console.log(`   Total chunks: ${chunks.length}`);
    console.log(`   Average length: ${Math.round(chunks.reduce((sum, c) => sum + c.narrative.length, 0) / chunks.length)} chars`);
    console.log(`   Shortest: ${Math.min(...chunks.map(c => c.narrative.length))} chars`);
    console.log(`   Longest: ${Math.max(...chunks.map(c => c.narrative.length))} chars`);
    
    const wordCounts = chunks.map(c => c.narrative.split(/\s+/).length);
    console.log(`\n   Word counts: ${wordCounts.join(', ')}`);
    
    console.log('\n💡 Tip: Edit the testSummary variable in test-chunking.js to test different inputs\n');
    
    // Ask if user wants to store in database
    console.log('='.repeat(70));
    console.log('\n📦 Do you want to store these chunks in the database?');
    console.log('   This will CLEAR existing memories and store these test chunks.');
    console.log('\n   Type "yes" to store, or press Enter to skip: ');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      rl.question('', async (answer) => {
        if (answer.trim().toLowerCase() === 'yes') {
          console.log('\n🗑️  Clearing existing memories...');
          await clearAllMemories();
          
          console.log('💾 Storing test chunks in database...');
          await storeMemories(chunks);
          
          console.log(`✅ Successfully stored ${chunks.length} chunks in the database!`);
          console.log('\n💡 You can now run "npm start" and search for these memories.');
          console.log('   Try asking: @Nattochan What do you know about Knilios?\n');
        } else {
          console.log('\n⏭️  Skipped database storage.\n');
        }
        
        rl.close();
        resolve();
      });
    });
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.status === 401) {
      console.error('\n⚠️  Check your OPENAI_API_KEY in .env file');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Cannot connect to ChromaDB. Make sure it is running on port 8000');
      console.error('   Start it with: docker run -d -p 8000:8000 chromadb/chroma');
    }
    process.exit(1);
  }
}

// Check for API key
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
  console.error('❌ Error: OPENAI_API_KEY not configured');
  console.error('Please set your OpenAI API key in .env file\n');
  process.exit(1);
}

console.log('🚀 AI Chunking Test for Nattochan\n');
console.log('📌 This will use OpenAI API (GPT-4o)');
console.log('📌 Cost: ~$0.01-0.02 per run');
console.log('📌 Make sure ChromaDB is running if you want to store results\n');

testChunking().then(() => {
  console.log('Test completed!\n');
  process.exit(0);
});
