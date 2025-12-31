# AI Memory System Implementation Guide

A comprehensive guide for implementing a vector database-backed memory system for AI chatbots.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Core Concepts](#core-concepts)
- [Setup Instructions](#setup-instructions)
- [How It Works](#how-it-works)
- [Integration Guide](#integration-guide)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

This system provides AI chatbots with long-term memory using vector databases for semantic search. It allows the AI to remember and recall past conversations, user preferences, and important facts across sessions.

### Key Features

- ✅ **Semantic Memory Search**: Finds relevant memories based on meaning, not just keywords
- ✅ **Automatic Summarization**: Condenses conversations to manage context window
- ✅ **Fact Extraction**: Extracts and stores important information as searchable chunks
- ✅ **Query Reformulation**: Improves search accuracy by understanding context
- ✅ **Scalable**: Works for weeks/months of conversations
- ✅ **Cost-Efficient**: Minimizes API calls while maximizing utility

---

## Architecture

```
┌─────────────────┐
│   User Input    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              Query Reformulation (GPT-4o-mini)          │
│  "tell me more" → "user career goals AI engineering"   │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│           Vector Search (ChromaDB + Embeddings)         │
│  Finds top 3 most relevant memory chunks                │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│         AI Response (GPT-4o)                            │
│  Context: [Memories + Conversation Cache + Input]       │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              Conversation Cache                         │
│  Stores last 7 messages (user + assistant pairs)        │
│  When full → Summarize with GPT-4o                      │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              Rolling Summary                            │
│  Single text blob that keeps growing                    │
│  Merged each time cache is summarized                   │
└────────┬────────────────────────────────────────────────┘
         │
         ▼ (Manual: user types "process")
┌─────────────────────────────────────────────────────────┐
│         Memory Processing (GPT-4o)                      │
│  Summary → Fact-based narrative chunks                  │
│  "User is Sarah, software engineer from Seattle..."     │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│    Generate Embeddings (text-embedding-3-small)         │
│    Store in ChromaDB with metadata                      │
└─────────────────────────────────────────────────────────┘
```

---

## Core Concepts

### 1. Conversation Cache
- **Purpose**: Short-term memory for current conversation
- **Limit**: 7 messages (configurable via `CACHE_LIMIT`)
- **Behavior**: When full, summarizes and resets
- **Contains**: User and assistant message pairs

### 2. Rolling Summary
- **Purpose**: Medium-term memory accumulation
- **Type**: Single string that grows over time
- **Update**: Each time cache summarizes, appends to this
- **Lifecycle**: Cleared when processed into chunks

### 3. Memory Chunks
- **Purpose**: Long-term searchable memories
- **Storage**: Vector database (ChromaDB)
- **Format**: Self-contained fact-based statements
- **Size**: 2-4 sentences, 50-200 words
- **Example**: "User is Sarah, software engineer from Seattle with 5 years experience. Works at fintech startup. Wants to transition to AI engineering within next year."

### 4. Query Reformulation
- **Purpose**: Convert vague input into effective search queries
- **Model**: GPT-4o-mini (cheap, fast)
- **Input**: User message + recent conversation context
- **Output**: Optimized search query
- **Cost**: ~$0.0001 per query

### 5. Vector Search
- **Purpose**: Find semantically similar memories
- **How**: Converts query to embedding, finds nearest neighbors
- **Results**: Top 3 most relevant chunks
- **Cost**: Nearly free (storage-based pricing)

---

## Setup Instructions

### Prerequisites

- Node.js 16+
- Python 3.8+ (for ChromaDB)
- OpenAI API key
- Docker (optional, for ChromaDB)

### Installation

1. **Clone/Create Project**
   ```bash
   mkdir my-ai-memory
   cd my-ai-memory
   npm init -y
   ```

2. **Install Dependencies**
   ```bash
   npm install openai chromadb dotenv
   ```

3. **Setup ChromaDB**
   
   **Option A: Docker (Recommended)**
   ```bash
   docker run -d -p 8000:8000 --name chroma-server chromadb/chroma
   ```
   
   **Option B: Python**
   ```bash
   pip install chromadb
   chroma run --host localhost --port 8000
   ```

4. **Configure Environment**
   
   Create `.env` file:
   ```env
   OPENAI_API_KEY=sk-your-actual-key-here
   CHROMA_PATH=http://localhost:8000
   ```

5. **Copy Core Files**
   
   Copy these files from the prototype:
   - `vectorDB.js` - ChromaDB operations
   - `memoryProcessor.js` - Summarization and chunking
   - `index.js` - Main application (adapt as needed)

---

## How It Works

### Chat Flow

1. **User sends message**
2. **System reformulates query** using recent context
3. **Searches vector DB** for relevant memories (top 3)
4. **Builds prompt** with: system message + memories + cache + input
5. **GPT-4o generates response**
6. **Adds exchange to cache** (user message + AI response)
7. **If cache full (7 messages)**:
   - Summarize entire cache with GPT-4o
   - Append summary to rolling summary
   - Reset cache with summary as context

### Memory Storage Flow

1. **User types `process` command** (or trigger automatically)
2. **System combines**: rolling summary + any residual cache
3. **GPT-4o extracts facts** into narrative chunks
4. **Generate embeddings** for each chunk (text-embedding-3-small)
5. **Store in ChromaDB** with metadata (timestamp, topics, etc.)
6. **Clear summary and cache**

### Memory Retrieval

1. **Convert search query to embedding**
2. **ChromaDB finds nearest vectors** (cosine similarity)
3. **Return top 3 chunks** with narratives and metadata
4. **Inject into AI context** as "relevant memories from past conversations"

---

## Integration Guide

### For Discord Bots

Replace your existing `handleAIChat` function:

```javascript
const { searchMemories, storeMemories } = require('./vectorDB');
const { summarizeConversation, processConversations } = require('./memoryProcessor');
const { reformulateQuery } = require('./queryReformulation');

// Per-user or per-channel state
const userStates = new Map(); // userId -> { cache, summary }

async function handleAIChat(message, client) {
  const userId = message.author.id;
  
  // Initialize state for user
  if (!userStates.has(userId)) {
    userStates.set(userId, {
      conversationCache: [],
      currentSummary: ''
    });
  }
  
  const state = userStates.get(userId);
  const input = message.content.replace(/<@!?\d+>/g, '').trim();
  
  // Query reformulation
  const searchQuery = await reformulateQuery(input, state.conversationCache);
  
  // Memory search
  const memories = await searchMemories(searchQuery, 3);
  
  // Build messages
  const messages = [
    { role: 'system', content: 'Your system prompt here' }
  ];
  
  if (memories.length > 0) {
    const memoryContext = memories.map(m => m.narrative).join(' | ');
    messages.push({
      role: 'system',
      content: `Relevant memories: ${memoryContext}`
    });
  }
  
  messages.push(...state.conversationCache);
  messages.push({ role: 'user', content: input });
  
  // Get AI response
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    max_tokens: 1000
  });
  
  const reply = response.choices[0].message.content;
  await message.channel.send(reply);
  
  // Update cache
  state.conversationCache.push(
    { role: 'user', content: input },
    { role: 'assistant', content: reply }
  );
  
  // Auto-summarize when cache full
  if (state.conversationCache.length >= 7) {
    const summary = await summarizeConversation(state.conversationCache);
    
    if (state.currentSummary) {
      state.currentSummary += `\n\n${summary}`;
    } else {
      state.currentSummary = summary;
    }
    
    state.conversationCache = [{
      role: 'user',
      content: `Previous context: ${state.currentSummary}`
    }];
  }
}

// Background task: Process memories periodically
setInterval(async () => {
  for (const [userId, state] of userStates.entries()) {
    if (state.currentSummary) {
      const chunks = await processConversations([state.currentSummary]);
      await storeMemories(chunks);
      state.currentSummary = '';
      state.conversationCache = [];
    }
  }
}, 3600000); // Every hour
```

### For Web Applications

```javascript
// Express.js example
app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;
  
  // Get session state from database/cache
  const session = await getSession(sessionId);
  
  // Use the same flow as above
  const searchQuery = await reformulateQuery(message, session.cache);
  const memories = await searchMemories(searchQuery, 3);
  
  // ... rest of chat logic
  
  // Save session state
  await saveSession(sessionId, session);
  
  res.json({ reply, memories });
});
```

---

## Best Practices

### Cache Management

- ✅ **Keep cache small**: 7-10 messages max
- ✅ **Summarize frequently**: Prevents context overflow
- ✅ **Include summary in context**: Maintains continuity

### Memory Chunking

- ✅ **Focus on facts**: Not conversation flow
- ✅ **Self-contained**: Each chunk should make sense alone
- ✅ **Consolidate related info**: "User is X, lives in Y, works as Z"
- ❌ **Avoid**: "Then user said..." or "Conversation shifted to..."

### Query Optimization

- ✅ **Use reformulation**: Dramatically improves recall
- ✅ **Include context**: Last 2-4 messages
- ✅ **Use mini model**: GPT-4o-mini is sufficient and cheap

### Storage Timing

- ✅ **Manual trigger**: Good for testing/prototypes
- ✅ **Periodic**: Every hour or daily (background task)
- ✅ **On demand**: When summary reaches certain size
- ❌ **After every message**: Too expensive, unnecessary

### Memory Limits

- ✅ **Implement cleanup**: Delete memories older than X days
- ✅ **Deduplication**: Check for similar chunks before storing
- ✅ **Cap total**: Limit to 1000-5000 chunks per user

---

## Troubleshooting

### Issue: Memories not being found

**Solutions:**
- Check if chunks are actually stored (`memories` command)
- Verify ChromaDB is running (`curl http://localhost:8000/api/v1/heartbeat`)
- Ensure query reformulation is working (check console output)
- Increase search results limit (try top 5 instead of top 3)

### Issue: Chunks too long/verbose

**Solution:**
- Adjust prompt in `memoryProcessor.js`
- Emphasize "2-4 sentences" and "concise facts"
- Add word count validation (already implemented)

### Issue: Context loss between sessions

**Solutions:**
- Persist `conversationCache` and `currentSummary` to database
- Load state when user reconnects
- Include "Previous conversation context" in first message

### Issue: High API costs

**Solutions:**
- Use GPT-4o-mini for reformulation (already implemented)
- Reduce cache summarization frequency (increase `CACHE_LIMIT` to 10-14)
- Batch memory processing (process multiple summaries at once)
- Use cheaper embedding model if needed

### Issue: Duplicate memories

**Solutions:**
- Implement deduplication check before storing
- Search for similar chunks (similarity > 0.9) and skip
- Periodic cleanup of near-duplicates

---

## Cost Analysis

### Per Message (typical):

| Operation | Model | Cost |
|-----------|-------|------|
| Query Reformulation | GPT-4o-mini | $0.0001 |
| Embedding Generation | text-embedding-3-small | $0.00002 |
| Vector Search | ChromaDB | ~$0.00001 |
| AI Response | GPT-4o | $0.0025 - $0.01 |
| **Total** | | **~$0.0026 - $0.0101** |

### Per Summarization:

| Operation | Model | Cost |
|-----------|-------|------|
| Summarize Cache (7 msgs) | GPT-4o | $0.002 - $0.005 |

### Per Memory Processing:

| Operation | Model | Cost |
|-----------|-------|------|
| Chunk Generation | GPT-4o | $0.005 - $0.015 |
| Embeddings (10 chunks) | text-embedding-3-small | $0.0002 |
| Storage | ChromaDB | $0.0001 |
| **Total** | | **~$0.0053 - $0.0153** |

**Daily estimate (100 messages/day):**
- Chat: ~$0.26 - $1.01
- Summarizations: ~$0.04 - $0.10 (assuming 2 per day)
- Memory processing: ~$0.01 - $0.03 (once daily)
- **Total: ~$0.31 - $1.14/day** or **~$9.30 - $34.20/month**

---

## Performance Metrics

### Expected Results:

- **Memory Search**: < 100ms
- **Query Reformulation**: 200-500ms
- **AI Response**: 1-3 seconds
- **Summarization**: 2-5 seconds
- **Memory Processing**: 3-10 seconds (depends on summary size)

### Scaling:

- **Vector DB**: Handles millions of chunks efficiently
- **Search Quality**: Remains high even with 10,000+ chunks
- **Per-user isolation**: Use collection per user or metadata filtering

---

## Testing

### Quick Test Suite

```bash
# Test chunking (with API calls)
npm run test:chunking

# Test full system (no API calls)
npm test

# Interactive testing
npm start
```

### Test Checklist

- ✅ Personal info preserved (name, location, job)
- ✅ Preferences remembered (diet, allergies, interests)
- ✅ Numbers retained (budget, dates, quantities)
- ✅ Chunks are self-contained
- ✅ Facts not conversation flow
- ✅ Query reformulation improves recall
- ✅ Memories persist across restarts

---

## Advanced Features

### Multi-User Support

```javascript
// Separate collections per user
const collectionName = `memories_${userId}`;
collection = await client.getOrCreateCollection({ name: collectionName });
```

### Metadata Filtering

```javascript
// Store with metadata
await collection.add({
  documents: [narrative],
  metadatas: [{ 
    userId: 'user123',
    category: 'personal_info',
    importance: 'high'
  }]
});

// Query with filters
const results = await collection.query({
  queryEmbeddings: [embedding],
  where: { category: 'personal_info' }
});
```

### Importance Scoring

Add importance ratings to chunks and prioritize high-importance memories:

```javascript
metadata: {
  importance: 0.9, // 0.0 - 1.0
  category: 'critical_preference'
}
```

---

## Next Steps

1. **Integrate into your project** using the integration guide
2. **Test with real conversations** and iterate on prompts
3. **Monitor costs** and adjust settings as needed
4. **Implement cleanup** for production use
5. **Add per-user memory isolation** if multi-user
6. **Fine-tune chunk size** based on your use case

---

## Resources

- [OpenAI API Docs](https://platform.openai.com/docs)
- [ChromaDB Documentation](https://docs.trychroma.com)
- [Vector Database Guide](https://www.pinecone.io/learn/vector-database/)
- [Embedding Best Practices](https://platform.openai.com/docs/guides/embeddings)

---

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [Best Practices](#best-practices)
3. Test with `npm run test:chunking` to isolate issues
4. Check ChromaDB server status

---

**Built with:**
- OpenAI GPT-4o & text-embedding-3-small
- ChromaDB vector database
- Node.js

**License:** MIT
