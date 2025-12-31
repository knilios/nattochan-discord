/**
 * Test vector search functionality
 * Tests the semantic search and query reformulation
 * 
 * Usage: node test-search.js
 */

require('dotenv').config();
const readline = require('readline');
const { searchMemories, getAllMemories, storeMemories } = require('./src/modules/vectorDB');
const { reformulateQuery } = require('./src/modules/memoryProcessor');

// Sample test memories to search through
const testMemories = [
  {
    narrative: "Knilios repeatedly presents unsafe Java and JavaScript code which Nattochan mocks and denies is her source code. Despite the teasing, Nattochan occasionally provides correct code examples when pushed, showing expertise in Java getters/setters and JPA entities.",
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'test',
      users: 'Knilios',
      topics: 'coding, java, javascript, source code'
    }
  },
  {
    narrative: "Magical Girl is learning Python and asks for programming resources. Tea Drinker is working on a Discord bot project with Discord.js. Nattochan provides surprisingly helpful technical assistance despite claiming to be useless.",
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'test',
      users: 'Magical Girl, Tea Drinker',
      topics: 'python, discord.js, programming, learning'
    }
  },
  {
    narrative: "C-Horse makes chaotic and inappropriate remarks, frequently demands Nattochan's source code. Nattochan refuses humorously and deflects with sarcasm. Their interactions are characterized by playful antagonism.",
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'test',
      users: 'C-Horse',
      topics: 'chaos, source code, humor'
    }
  },
  {
    narrative: "The group enjoys gaming together, particularly Among Us, Valorant, Blue Archive, Genshin Impact, and Minecraft. Knilios gets teased about being bad at Valorant. There's discussion about scheduling gaming sessions.",
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'test',
      users: 'Knilios, group',
      topics: 'gaming, among us, valorant, minecraft, anime games'
    }
  },
  {
    narrative: "Magical Girl has a new cat named Luna. Nattochan expresses jealousy and wants a virtual pet. There's playful discussion about pets and animals.",
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'test',
      users: 'Magical Girl',
      topics: 'pets, cats, Luna, animals'
    }
  },
  {
    narrative: "Knilios is vegetarian and looking for Thai restaurant recommendations in Bangkok. Magical Girl is allergic to peanuts and must be careful with Asian cuisine. Sensei is visiting Japan next month and receives travel tips from Nattochan.",
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'test',
      users: 'Knilios, Magical Girl, Sensei',
      topics: 'food, travel, thailand, japan, allergies, vegetarian'
    }
  }
];

async function setupTestMemories() {
  console.log('📦 Setting up test memories...\n');
  
  const existing = await getAllMemories();
  
  if (existing.length > 0) {
    console.log(`⚠️  Found ${existing.length} existing memories in database.`);
    console.log('   Do you want to add test memories anyway? (yes/no): ');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      rl.question('', async (answer) => {
        rl.close();
        
        if (answer.trim().toLowerCase() === 'yes') {
          await storeMemories(testMemories);
          console.log(`✅ Added ${testMemories.length} test memories\n`);
          resolve(true);
        } else {
          console.log('⏭️  Using existing memories only\n');
          resolve(false);
        }
      });
    });
  } else {
    await storeMemories(testMemories);
    console.log(`✅ Added ${testMemories.length} test memories to empty database\n`);
    return true;
  }
}

async function testSearch() {
  console.log('🧪 Testing Vector Search\n');
  console.log('='.repeat(70));
  
  // Setup test data
  await setupTestMemories();
  
  // Test queries
  const queries = [
    "What do you know about Knilios?",
    "Tell me about pets",
    "Who's learning programming?",
    "What games do people play?",
    "Food preferences and allergies",
    "travel plans"
  ];
  
  console.log('\n' + '='.repeat(70));
  console.log('🔍 Testing search queries:\n');
  
  for (const query of queries) {
    console.log(`\n📝 Query: "${query}"`);
    console.log('-'.repeat(70));
    
    // Test query reformulation
    console.log('\n🔄 Reformulating query...');
    const reformulated = await reformulateQuery(query, []);
    
    if (reformulated !== query) {
      console.log(`   → "${reformulated}"`);
    } else {
      console.log('   → (no change)');
    }
    
    // Test search
    console.log('\n🔎 Searching memories...');
    const results = await searchMemories(reformulated, 2);
    
    if (results.length > 0) {
      console.log(`\n   Found ${results.length} relevant memories:`);
      results.forEach((result, idx) => {
        console.log(`\n   ${idx + 1}. ${result.narrative}`);
        if (result.distance) {
          console.log(`      (Distance: ${result.distance.toFixed(4)})`);
        }
      });
    } else {
      console.log('\n   ❌ No results found');
    }
    
    console.log('\n' + '='.repeat(70));
  }
  
  console.log('\n✅ Search test completed!\n');
  console.log('💡 Tips:');
  console.log('   - Lower distance = more relevant');
  console.log('   - Query reformulation helps with vague queries');
  console.log('   - Semantic search finds meaning, not just keywords\n');
}

// Check for API key
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
  console.error('❌ Error: OPENAI_API_KEY not configured');
  console.error('Please set your OpenAI API key in .env file\n');
  process.exit(1);
}

console.log('🚀 Vector Search Test\n');
console.log('📌 This will use OpenAI API for embeddings and query reformulation');
console.log('📌 Cost: ~$0.005 per run');
console.log('📌 Make sure ChromaDB is running on port 8000\n');

testSearch().then(() => {
  console.log('Test completed!\n');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Error:', error.message);
  if (error.code === 'ECONNREFUSED') {
    console.error('\n⚠️  Cannot connect to ChromaDB');
    console.error('   Start it with: docker run -d -p 8000:8000 chromadb/chroma\n');
  }
  process.exit(1);
});
