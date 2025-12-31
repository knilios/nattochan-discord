const cron = require('node-cron');
const config = require('../config/config');
const logger = require('../utils/logger');
const { storeMemories } = require('../modules/vectorDB');
const { processConversations } = require('../modules/memoryProcessor');

// Store daily summaries
let dailySummaries = [];

/**
 * Add a summary to be processed later
 * @param {string} summary - Conversation summary to store
 */
function addSummary(summary) {
  if (summary && summary.trim()) {
    dailySummaries.push({
      summary,
      timestamp: new Date().toISOString(),
    });
    logger.info(`[Scheduler] Added summary to daily batch (total: ${dailySummaries.length})`);
  }
}

/**
 * Get current summaries count
 * @returns {number}
 */
function getSummariesCount() {
  return dailySummaries.length;
}

/**
 * Process and store all accumulated summaries
 */
async function processAndStoreSummaries() {
  if (dailySummaries.length === 0) {
    logger.info('[Scheduler] No summaries to process');
    return;
  }

  try {
    logger.info(`[Scheduler] Processing ${dailySummaries.length} summaries from today...`);

    // Extract just the summary texts
    const summaryTexts = dailySummaries.map(s => s.summary);

    // Process into narrative chunks
    const chunks = await processConversations(summaryTexts);

    if (chunks.length > 0) {
      // Store in vector database
      const success = await storeMemories(chunks);

      if (success) {
        logger.success(`[Scheduler] Successfully processed and stored ${chunks.length} memory chunks`);
        // Clear processed summaries
        dailySummaries = [];
      } else {
        logger.error('[Scheduler] Failed to store memories in vector DB');
      }
    } else {
      logger.warn('[Scheduler] No chunks created from summaries');
      dailySummaries = []; // Clear anyway to avoid reprocessing
    }
  } catch (error) {
    logger.error('[Scheduler] Error processing summaries:', error.message);
  }
}

/**
 * Manual trigger for processing (for testing or commands)
 */
async function manualProcess() {
  logger.info('[Scheduler] Manual processing triggered');
  await processAndStoreSummaries();
}

/**
 * Setup scheduled task for daily memory processing
 * @param {Client} client - Discord client (optional, for context)
 */
function setupScheduler(client) {
  const scheduleTime = config.scheduler?.memoryProcessTime || '23:00'; // Default 11 PM
  const [hour, minute] = scheduleTime.split(':');

  // Cron format: minute hour * * *
  const cronExpression = `${minute} ${hour} * * *`;

  logger.info(`[Scheduler] Setting up daily memory processing at ${scheduleTime} (${cronExpression})`);

  // Schedule daily task
  const task = cron.schedule(cronExpression, async () => {
    logger.info('[Scheduler] Daily memory processing task triggered');
    await processAndStoreSummaries();
  }, {
    scheduled: true,
    timezone: config.scheduler?.timezone || 'Asia/Bangkok'
  });

  logger.success(`[Scheduler] Scheduled daily memory processing at ${scheduleTime}`);

  return task;
}

module.exports = {
  setupScheduler,
  addSummary,
  getSummariesCount,
  manualProcess,
};
