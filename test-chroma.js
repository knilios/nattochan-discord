/**
 * Quick diagnostic to test ChromaDB connection
 */

require('dotenv').config();
const { ChromaClient } = require('chromadb');

async function testConnection() {
  console.log('🔍 Testing ChromaDB Connection...\n');
  
  const chromaPath = process.env.CHROMA_PATH || 'http://localhost:8000';
  console.log(`Connecting to: ${chromaPath}\n`);
  
  try {
    const client = new ChromaClient({ path: chromaPath });
    
    console.log('1️⃣ Testing heartbeat...');
    const heartbeat = await client.heartbeat();
    console.log('✅ Heartbeat:', heartbeat);
    
    console.log('\n2️⃣ Getting version...');
    const version = await client.version();
    console.log('✅ Version:', version);
    
    console.log('\n3️⃣ Listing collections...');
    const collections = await client.listCollections();
    console.log(`✅ Found ${collections.length} collections:`, collections.map(c => c.name));
    
    console.log('\n4️⃣ Creating test collection...');
    const testCollection = await client.getOrCreateCollection({ name: 'test_collection' });
    console.log('✅ Collection created:', testCollection.name);
    
    console.log('\n5️⃣ Testing add document...');
    await testCollection.add({
      ids: ['test1'],
      documents: ['This is a test document'],
      metadatas: [{ source: 'test' }]
    });
    console.log('✅ Document added');
    
    console.log('\n6️⃣ Testing count...');
    const count = await testCollection.count();
    console.log('✅ Collection has', count, 'documents');
    
    console.log('\n7️⃣ Deleting test collection...');
    await client.deleteCollection({ name: 'test_collection' });
    console.log('✅ Test collection deleted');
    
    console.log('\n🎉 All tests passed! ChromaDB is working correctly.\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 ChromaDB is not running. Start it with:');
      console.error('   docker run -d -p 8000:8000 chromadb/chroma');
    }
  }
}

testConnection();
