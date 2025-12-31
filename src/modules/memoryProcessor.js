const OpenAI = require('openai');
const config = require('../config/config');
const logger = require('../utils/logger');

let openai = null;

/**
 * Initialize OpenAI client
 */
function initializeOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }
  return openai;
}

/**
 * Process conversation summaries into narrative chunks
 * @param {Array<string>} summaries - Array of conversation summaries
 * @returns {Promise<Array>} - Array of chunk objects with narrative and metadata
 */
async function processConversations(summaries) {
  try {
    const ai = initializeOpenAI();
    
    if (!summaries || summaries.length === 0) {
      logger.info('[MemoryProcessor] No summaries to process');
      return [];
    }

    logger.info(`[MemoryProcessor] Processing ${summaries.length} summaries...`);

    // Combine all summaries into one text
    const combinedSummaries = summaries.map((s, idx) => `Summary ${idx + 1}:\n${s}`).join('\n\n');

    // Create prompt for GPT-4o
    const prompt = `Extract important facts and information from these conversation summaries. Think like long-term human memory - what would someone remember weeks later?

CRITICAL RULES:
1. Each chunk must be SELF-CONTAINED and make sense on its own
2. Focus on FACTS and ATTRIBUTES, not conversation flow
3. Extract WHO, WHAT, WHERE, WHEN - not "discussed" or "shifted to"
4. Combine related information into one chunk
5. Keep chunks 2-4 sentences, focused on one topic
6. Separate unrelated topics with | character

What to extract:
- User information (username, preferences, behaviors, relationships)
- Specific facts and details (games played, topics discussed, running jokes)
- Personality traits or interactions shown
- Preferences, likes/dislikes, recurring topics
- Bot's relationships with different users (who she teases, who helps her, etc.)

BAD (conversation flow): "User asked about code. Conversation shifted to gaming."
GOOD (facts only): "User is interested in coding and gaming, often switches between topics."

BAD (fragmented): "User likes Minecraft. | User plays Fortnite. | User wants Java help."
GOOD (self-contained): "User enjoys gaming (Minecraft, Fortnite) and occasionally needs help with Java programming."

BAD (incomplete context): "They helped with source code and got teased."
GOOD (complete context): "Knilios repeatedly shares unsafe code which Nattochan mocks, but she occasionally helps with actual programming questions when pushed."

Summaries:
${combinedSummaries}

Extract the key facts as self-contained chunks, separated by |.`;

    // Get AI response
    const response = await ai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a long-term memory system for Nattochan, an anime-style Discord chatbot. Extract and consolidate important facts from conversations. Each memory chunk should be self-contained (readable independently), focus on facts not conversation flow, and capture what someone would remember long-term about users, their interactions, and relationships. Combine related information. Output only memory chunks separated by |.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2500
    });

    const narrativeText = response.choices[0].message.content.trim();
    logger.info('[MemoryProcessor] Generated narratives:', narrativeText);

    // Parse response into chunks
    const chunkTexts = narrativeText
      .split('|')
      .map(chunk => chunk.trim())
      .filter(chunk => chunk.length > 0)
      .filter(chunk => {
        // Remove chunks that are too short or too long
        const wordCount = chunk.split(/\s+/).length;
        return wordCount >= 10 && wordCount <= 200;
      });

    // Create chunk objects with metadata
    const chunks = chunkTexts.map(narrative => {
      // Extract basic metadata
      const metadata = {
        timestamp: new Date().toISOString(),
        source: 'conversation_summary',
        chunk_length: narrative.length,
        bot: 'Nattochan'
      };

      // Try to extract topics/keywords (simple approach)
      const words = narrative.toLowerCase().split(/\s+/);
      const topics = words.filter(word => word.length > 5).slice(0, 3);
      if (topics.length > 0) {
        metadata.topics = topics.join(', ');
      }

      // Try to extract mentioned usernames
      const usernamePattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g;
      const usernames = narrative.match(usernamePattern) || [];
      if (usernames.length > 0) {
        metadata.users = [...new Set(usernames)].join(', ');
      }

      return {
        narrative,
        metadata
      };
    });

    logger.success(`[MemoryProcessor] Created ${chunks.length} narrative chunks`);

    return chunks;
  } catch (error) {
    logger.error('[MemoryProcessor] Error processing conversations:', error.message);
    throw error;
  }
}

/**
 * Summarize conversation cache
 * @param {Array} conversationCache - Array of message objects
 * @returns {Promise<string>} - Summary of the conversation
 */
async function summarizeConversation(conversationCache) {
  try {
    const ai = initializeOpenAI();
    
    // Build conversation text
    let conversationText = "";
    for (let msg of conversationCache) {
      conversationText += msg.content + "\n";
    }
    conversationText += "\nsummary:";

    logger.info('[MemoryProcessor] Summarizing conversation...');

    // Create summary using GPT-4o
    const response = await ai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Summarize all the context in this following Discord chat for Nattochan (an anime-style Discord chatbot) to read. Focus on user interactions, personalities shown, and important facts mentioned.'
        },
        {
          role: 'user',
          content: conversationText
        }
      ],
      temperature: 0.12,
      max_tokens: 1000
    });

    const summary = response.choices[0].message.content;
    logger.info('[MemoryProcessor] Conversation summarized');
    logger.debug('[MemoryProcessor] Summary:', summary);

    return summary;
  } catch (error) {
    logger.error('[MemoryProcessor] Error summarizing conversation:', error.message);
    throw error;
  }
}

/**
 * Reformulate user query for better vector search
 * @param {string} input - User input
 * @param {Array} recentContext - Recent conversation messages
 * @returns {Promise<string>} - Reformulated search query
 */
async function reformulateQuery(input, recentContext = []) {
  try {
    const ai = initializeOpenAI();
    
    // Build context from recent conversation
    const contextStr = recentContext
      .slice(-4) // Last 2 exchanges
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
    
    const prompt = `Given this user input and recent conversation context, generate a concise search query to find relevant memories.

Recent context:
${contextStr || 'No recent context'}

User input: "${input}"

Generate a search query that captures:
- What the user is asking about
- Key entities, topics, or concepts
- Implicit references from context
- Username if mentioned or implied

Output ONLY the search query, nothing else. Keep it under 20 words.`;

    const response = await ai.chat.completions.create({
      model: 'gpt-4o-mini', // Use cheaper model for this
      messages: [
        {
          role: 'system',
          content: 'You are a search query optimizer. Convert user messages into effective search queries for finding relevant memories. Output only the query.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 100,
      temperature: 0.3
    });

    const searchQuery = response.choices[0].message.content.trim();
    return searchQuery;
  } catch (error) {
    logger.error('[QueryReformulation] Error:', error.message);
    // Fallback to original input
    return input;
  }
}

module.exports = {
  processConversations,
  summarizeConversation,
  reformulateQuery,
};
