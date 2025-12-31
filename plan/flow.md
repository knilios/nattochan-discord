## Generating texts
```
User Message → conversation_cache → Search Vector DB for relevant memories → GPT-4o → Response
                ↓ (when full)
            Summarize & Reset
```

## Saving conversations
```
Certain time hits (eg. 11 pm everyday) -> All of the summarizations and leftover responses get enriched -> GPT-4o breaks it down to chunks -> Those chunks get stored inside the vector DB.
```