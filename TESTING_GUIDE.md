# Testing Vector Database

## Quick Test (Using Discord Command)

1. **Make sure ChromaDB is running:**
   ```bash
   # Check if running
   curl http://localhost:8000/api/v1/heartbeat
   
   # Or if using Docker
   docker ps | grep chroma
   ```

2. **Start your bot:**
   ```bash
   npm start
   ```

3. **Run the test command in Discord:**
   ```
   !testdb
   ```

   This will:
   - ✅ Test ChromaDB connection
   - ✅ Store test memories
   - ✅ Search for memories
   - ✅ Retrieve all memories

## Manual Testing Steps

### Step 1: Check ChromaDB Connection

In Discord:
```
!memory stats
```

Expected output should show:
```
📊 Memory Statistics
...
Vector Database:
- Stored memories: X chunks
```

If you see an error, ChromaDB is not running properly.

### Step 2: Test Memory Storage

Have a conversation with the bot:
```
@Nattochan I love playing Minecraft and coding in Python
```
```
@Nattochan I have a pet cat named Luna
```
```
@Nattochan My favorite food is pizza
```
```
@Nattochan I'm learning JavaScript
```
```
@Nattochan I prefer cats over dogs
```
```
@Nattochan I work as a software engineer
```
```
@Nattochan I live in Tokyo
```

Then check stats:
```
!memory stats
```

You should see conversation cache building up.

### Step 3: Trigger Summarization

Continue chatting until you see in the console:
```
[Cache limit reached, summarizing conversation...]
```

Or check stats and you'll see the cache reset.

### Step 4: Process Memories

Manually process summaries:
```
!memory process
```

Expected output:
```
⏳ Processing summaries into vector database...
✅ Memory processing complete!
```

Check the console logs for:
```
[MemoryProcessor] Processing X summaries...
[MemoryProcessor] Created X narrative chunks
Successfully stored X memories in vector DB
```

### Step 5: Verify Storage

List stored memories:
```
!memory list
```

You should see your memories like:
```
Stored Memories (3 total, showing first 5):
1. User loves playing Minecraft and coding in Python, currently learning JavaScript...
2. User has a pet cat named Luna and prefers cats over dogs...
3. User works as a software engineer living in Tokyo, favorite food is pizza...
```

### Step 6: Test Memory Retrieval

Start a NEW conversation and ask about something you mentioned:
```
@Nattochan What do you know about my pets?
```

Check the console logs for:
```
[Reformulated query: "user pets cats dogs"]
Searching for relevant memories...
Found 1 relevant memories
```

The bot should reference your cat Luna in the response!

Try another:
```
@Nattochan What's my favorite food?
```

Bot should mention pizza!

## Verification Checklist

- [ ] ChromaDB is running on port 8000
- [ ] Bot starts without errors
- [ ] `!memory stats` shows data
- [ ] Can have conversations (cache fills up)
- [ ] Summarization happens at cache limit
- [ ] `!memory process` works without errors
- [ ] `!memory list` shows stored memories
- [ ] Bot retrieves relevant memories when asked
- [ ] Console shows search/reformulation logs

## Common Issues

### ❌ "Vector DB not available"
**Solution:** Start ChromaDB
```bash
docker run -d -p 8000:8000 --name chroma-server chromadb/chroma
```

### ❌ "Error generating embedding"
**Solution:** Check OpenAI API key in `.env`

### ❌ "No memories found"
**Problem:** Database is empty
**Solution:** Have conversations and run `!memory process`

### ❌ Search returns wrong memories
**Problem:** Not enough data or query too vague
**Solution:** 
- Add more diverse conversations
- Use specific queries
- Check reformulated query in logs

## Expected Console Output

When working correctly, you should see:

**On Bot Start:**
```
[INFO] Initializing Vector Database...
[INFO] Connecting to ChromaDB at http://localhost:8000
[SUCCESS] Vector DB collection initialized: nattochan_memories
[INFO] Setting up memory scheduler...
[SUCCESS] Scheduled daily memory processing at 23:00
```

**During Chat (with memory search):**
```
[INFO] Query reformulated: "user pets cats"
[INFO] Searching for relevant memories...
[INFO] Found 1 relevant memories
  Memory 1: User has a pet cat named Luna...
```

**During Summarization:**
```
[INFO] [Cache limit reached, summarizing conversation...]
[MemoryProcessor] Summarizing conversation...
[MemoryProcessor] Conversation summarized
[Scheduler] Added summary to daily batch (total: 1)
```

**During Processing:**
```
[Scheduler] Processing 3 summaries from today...
[MemoryProcessor] Processing 3 summaries...
[MemoryProcessor] Generated narratives: User loves...
[MemoryProcessor] Created 2 narrative chunks
[SUCCESS] Successfully stored 2 memories in vector DB
```

## Advanced Testing

### Test Semantic Search

Store these memories:
1. "User enjoys playing video games like Minecraft and Fortnite"
2. "User is learning programming with Python and JavaScript"
3. "User has two cats named Luna and Shadow"

Then search with semantic queries:
- "gaming" → should find #1
- "coding" → should find #2  
- "animals" → should find #3

### Test Query Reformulation

Say vague things like:
```
@Nattochan tell me more about that
```

Check console - it should reformulate based on context.

### Test Time-based Memory

Process memories, then wait and ask:
```
@Nattochan What did we talk about earlier?
```

Should retrieve past conversation summaries.

---

**Ready to test? Run `!testdb` in Discord! 🚀**
