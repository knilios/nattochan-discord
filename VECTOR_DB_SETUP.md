# Vector Database Memory System Setup

## Overview

The bot now has long-term memory using ChromaDB vector database! It can remember past conversations and retrieve relevant context when chatting.

## How It Works

### Real-time Flow:
1. User sends a message
2. Bot reformulates the query for better search
3. Searches vector DB for relevant past memories
4. Combines memories + conversation cache
5. GPT-4o generates response with full context
6. Adds to conversation cache
7. When cache reaches 7 messages: summarizes and resets

### Daily Processing (11 PM):
1. All conversation summaries from the day are collected
2. GPT-4o processes them into narrative chunks
3. Chunks are embedded and stored in vector DB
4. Summaries are cleared

## Setup Instructions

### 1. Install ChromaDB

**Option A: Docker (Recommended)**
```bash
docker run -d -p 8000:8000 --name chroma-server chromadb/chroma
```

**Option B: Python**
```bash
pip install chromadb
chroma run --host localhost --port 8000
```

### 2. Install Dependencies
```bash
npm install
```

This will install:
- `chromadb` - Vector database client
- `node-cron` - Task scheduler
- `uuid` - Unique ID generation

### 3. Configure Environment

Update your `.env` file:
```env
# OpenAI
OPENAI_API_KEY=your_key_here

# Vector Database
CHROMA_PATH=http://localhost:8000
CHROMA_COLLECTION=nattochan_memories

# Scheduler
MEMORY_PROCESS_TIME=23:00
TIMEZONE=Asia/Bangkok
```

### 4. Start the Bot
```bash
npm start
```

## Usage

### Automatic Memory
The bot automatically:
- Searches for relevant memories during conversations
- Summarizes conversations when cache is full
- Processes summaries daily at 11 PM

### Manual Commands

**`!memory stats`** - View memory statistics
```
📊 Memory Statistics

Current Session:
- Conversation cache: 4 messages
- Has rolling summary: Yes

Pending Processing:
- Daily summaries: 3

Vector Database:
- Stored memories: 12 chunks
```

**`!memory process`** - Manually trigger memory processing
```
⏳ Processing summaries into vector database...
✅ Memory processing complete!
```

**`!memory list`** - View stored memories
```
Stored Memories (12 total, showing first 5):
1. Knilios repeatedly presents unsafe code which Nattochan mocks...
2. User enjoys gaming (Minecraft, Fortnite) and occasionally needs...
3. Tea Drinker and Magical Girl push narrative that Nattochan...
...
```

## Architecture

```
User Message
    ↓
Query Reformulation (GPT-4o-mini)
    ↓
Vector Search (ChromaDB)
    ↓
[Memories + Cache] → GPT-4o → Response
    ↓
Update Cache
    ↓
If Cache Full: Summarize → Add to Daily Batch
    ↓
Daily at 11 PM: Process → Store in Vector DB
```

## Key Files

- `src/modules/vectorDB.js` - ChromaDB operations
- `src/modules/memoryProcessor.js` - Summarization & chunking
- `src/modules/aiChat.js` - Updated with memory search
- `src/utils/scheduler.js` - Daily processing scheduler
- `src/commands/memory.js` - Memory management commands

## Troubleshooting

**ChromaDB connection failed**
- Make sure ChromaDB is running on port 8000
- Check `CHROMA_PATH` in `.env`
- Try: `docker ps` to see if container is running

**No memories being stored**
- Check logs for "[Scheduler]" messages
- Use `!memory stats` to see pending summaries
- Manually trigger: `!memory process`

**Memories not relevant**
- The system learns over time
- More conversations = better context
- Query reformulation helps improve search

## Cost Considerations

**Per Query:**
- Query reformulation: ~$0.0001 (GPT-4o-mini)
- Embedding search: Nearly free
- Response generation: ~$0.01 (GPT-4o)

**Daily Processing:**
- Summary processing: ~$0.02-0.05 per day
- Embeddings: ~$0.001 per 1000 words

**Total**: Approximately $1-2 per month for moderate usage

## Tips

1. **Start Fresh**: Use `!memory process` after several conversations to build initial memory
2. **Monitor**: Check `!memory stats` regularly to see what's pending
3. **Timezone**: Adjust `TIMEZONE` in `.env` for your location
4. **Schedule**: Change `MEMORY_PROCESS_TIME` if you prefer different time
5. **Testing**: The scheduler runs daily - use manual commands for testing

## What Gets Remembered

- User personalities and behaviors
- Running jokes and inside references
- Topics discussed frequently
- Relationships (who Nattochan teases, helps, etc.)
- Important facts mentioned
- Preferences and interests

## What Doesn't Get Stored

- Individual message contents (only summaries)
- Temporary/trivial chatter
- Conversation flow details
- Exact timestamps (just dates)

Enjoy your bot's new long-term memory! 🧠✨
