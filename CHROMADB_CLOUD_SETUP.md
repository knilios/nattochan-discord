# ChromaDB Cloud Setup Guide

This guide will help you connect your Nattochan Discord bot to ChromaDB cloud.

## Prerequisites

1. A ChromaDB cloud account
2. Your ChromaDB cloud credentials

## Configuration Steps

### 1. Get Your ChromaDB Cloud Credentials

From your ChromaDB cloud dashboard, you'll need:
- **Cloud URL**: Your ChromaDB cloud endpoint (e.g., `https://api.trychroma.com` or your custom endpoint)
- **API Key**: Your authentication token
- **Tenant**: Your tenant ID (usually provided in your cloud dashboard)
- **Database**: Your database name (usually provided in your cloud dashboard)

### 2. Update Your `.env` File

Open your `.env` file and update the following variables:

```env
# ChromaDB Cloud Configuration
CHROMA_PATH=https://your-cloud-endpoint.trychroma.com
CHROMA_COLLECTION=nattochan_memories
CHROMA_API_KEY=your_api_key_here
CHROMA_TENANT=your_tenant_id
CHROMA_DATABASE=your_database_name
```

**Example:**
```env
CHROMA_PATH=https://api.trychroma.com
CHROMA_COLLECTION=nattochan_memories
CHROMA_API_KEY=chroma_abc123xyz789
CHROMA_TENANT=my-tenant
CHROMA_DATABASE=my-database
```

### 3. Test Your Connection

Run the diagnostic test to verify your connection:

```bash
node test-chroma.js
```

You should see:
```
✅ ChromaDB connection successful
✅ Vector DB collection initialized: nattochan_memories
```

### 4. Test the Full System

Test chunking and search:

```bash
npm run test:chunking
npm run test:search
```

## Switching Between Local and Cloud

### For Local ChromaDB:
```env
CHROMA_PATH=http://localhost:8000
CHROMA_COLLECTION=nattochan_memories
CHROMA_API_KEY=
CHROMA_TENANT=default_tenant
CHROMA_DATABASE=default_database
```

### For ChromaDB Cloud:
```env
CHROMA_PATH=https://your-cloud-endpoint.trychroma.com
CHROMA_COLLECTION=nattochan_memories
CHROMA_API_KEY=your_api_key_here
CHROMA_TENANT=your_tenant_id
CHROMA_DATABASE=your_database_name
```

## Troubleshooting

### Connection Failed
- Verify your `CHROMA_PATH` is correct (should start with `https://`)
- Check that your API key is valid
- Ensure your tenant and database names match your cloud dashboard

### Authentication Error
- Double-check your `CHROMA_API_KEY`
- Verify the API key hasn't expired
- Contact ChromaDB support if needed

### Collection Not Found
- The bot will automatically create the collection on first run
- Make sure you have permissions to create collections in your cloud instance

## Important Notes

1. **API Key Security**: Never commit your `.env` file with real credentials to Git
2. **Cost**: ChromaDB cloud may have usage costs - check their pricing
3. **Rate Limits**: Cloud instances may have rate limits different from local
4. **Data Privacy**: Your conversation data will be stored in the cloud

## Need Help?

- Check the ChromaDB cloud documentation: https://docs.trychroma.com/
- Contact ChromaDB support
- Review the bot logs for detailed error messages
