const { ChromaClient } = require('chromadb');
const OpenAI = require('openai');
const config = require('../config/config');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

let chromaClient = null;
let collection = null;
let openai = null;

/**
 * Initialize Chroma client and collection
 */
async function initializeVectorDB() {
  if (collection) {
    return collection;
  }

  try {
    // Initialize OpenAI for embeddings
    if (!openai) {
      openai = new OpenAI({
        apiKey: config.openai.apiKey,
      });
    }

    // Initialize Chroma client
    chromaClient = new ChromaClient({
      path: config.vectorDB.path || 'http://localhost:8000',
    });

    logger.info(`Connecting to ChromaDB at ${config.vectorDB.path || 'http://localhost:8000'}`);

    // Test connection first
    try {
      const heartbeat = await chromaClient.heartbeat();
      logger.success('ChromaDB connection successful');
    } catch (error) {
      logger.error('Cannot reach ChromaDB server:', error.message);
      logger.warn('Make sure ChromaDB is running: docker run -d -p 8000:8000 chromadb/chroma');
      throw error;
    }

    // Get or create collection
    try {
      collection = await chromaClient.getOrCreateCollection({
        name: config.vectorDB.collectionName || 'nattochan_memories',
        embeddingFunction: null, // We provide embeddings ourselves via OpenAI
      });
      logger.success(`Vector DB collection initialized: ${config.vectorDB.collectionName || 'nattochan_memories'}`);
    } catch (error) {
      logger.error('Failed to get/create collection:', error.message);
      throw error;
    }

    return collection;
  } catch (error) {
    logger.error('Failed to initialize Vector DB:', error.message);
    logger.warn('Bot will continue without vector database functionality');
    return null;
  }
}

/**
 * Generate embedding for text using OpenAI
 * @param {string} text - Text to embed
 * @returns {Promise<Array<number>>} - Embedding vector
 */
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    logger.error('Error generating embedding:', error.message);
    throw error;
  }
}

/**
 * Search for relevant memories
 * @param {string} query - Search query
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>} - Array of relevant memory objects
 */
async function searchMemories(query, limit = 3) {
  try {
    const coll = await initializeVectorDB();
    if (!coll) {
      logger.warn('Vector DB not available, skipping memory search');
      return [];
    }

    // Check if collection has any documents first
    const count = await coll.count();
    if (count === 0) {
      logger.info('Vector DB is empty, no memories to search');
      return [];
    }

    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    // Search in ChromaDB
    const results = await coll.query({
      queryEmbeddings: [queryEmbedding],
      nResults: Math.min(limit, count), // Don't request more than available
    });

    // Format results
    if (!results.documents || !results.documents[0] || results.documents[0].length === 0) {
      return [];
    }

    const memories = results.documents[0].map((doc, idx) => ({
      narrative: doc,
      metadata: results.metadatas?.[0]?.[idx] || {},
      distance: results.distances?.[0]?.[idx],
    }));

    logger.info(`Found ${memories.length} relevant memories`);
    return memories;
  } catch (error) {
    logger.error('Error searching memories:', error.message);
    logger.warn('Continuing without memory search');
    return [];
  }
}

/**
 * Store memory chunks in vector database
 * @param {Array} chunks - Array of chunk objects with narrative and metadata
 * @returns {Promise<boolean>} - Success status
 */
async function storeMemories(chunks) {
  try {
    const coll = await initializeVectorDB();
    if (!coll) {
      logger.warn('Vector DB not available, cannot store memories');
      return false;
    }

    if (!chunks || chunks.length === 0) {
      logger.warn('No chunks to store');
      return false;
    }

    logger.info(`Storing ${chunks.length} memory chunks...`);

    // Prepare data for ChromaDB
    const ids = [];
    const documents = [];
    const embeddings = [];
    const metadatas = [];

    for (const chunk of chunks) {
      // Generate unique ID
      const id = uuidv4();
      ids.push(id);

      // Store narrative as document
      documents.push(chunk.narrative);

      // Generate embedding
      const embedding = await generateEmbedding(chunk.narrative);
      embeddings.push(embedding);

      // Store metadata
      metadatas.push(chunk.metadata || {});
    }

    // Add to collection
    await coll.add({
      ids,
      documents,
      embeddings,
      metadatas,
    });

    logger.success(`Successfully stored ${chunks.length} memories in vector DB`);
    return true;
  } catch (error) {
    logger.error('Error storing memories:', error.message);
    return false;
  }
}

/**
 * Get all stored memories (for debugging/display)
 * @returns {Promise<Array>} - All memories
 */
async function getAllMemories() {
  try {
    const coll = await initializeVectorDB();
    if (!coll) {
      return [];
    }

    const results = await coll.get();

    if (!results.documents || results.documents.length === 0) {
      return [];
    }

    const memories = results.documents.map((doc, idx) => ({
      id: results.ids[idx],
      narrative: doc,
      metadata: results.metadatas?.[idx] || {},
    }));

    return memories;
  } catch (error) {
    logger.error('Error getting all memories:', error.message);
    return [];
  }
}

/**
 * Clear all memories from database (use with caution!)
 * @returns {Promise<boolean>} - Success status
 */
async function clearAllMemories() {
  try {
    const coll = await initializeVectorDB();
    if (!coll) {
      return false;
    }

    // Delete collection and recreate
    await chromaClient.deleteCollection({
      name: config.vectorDB.collectionName || 'nattochan_memories',
    });

    collection = null;
    await initializeVectorDB();

    logger.success('All memories cleared from vector DB');
    return true;
  } catch (error) {
    logger.error('Error clearing memories:', error.message);
    return false;
  }
}

module.exports = {
  initializeVectorDB,
  searchMemories,
  storeMemories,
  getAllMemories,
  clearAllMemories,
};
