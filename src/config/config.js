require('dotenv').config();

module.exports = {
  // Discord configuration
  discord: {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID || '698070844441624658',
    prefix: process.env.PREFIX || '!',
    ownerId: process.env.BOT_OWNER_ID,
  },

  // OpenAI configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },

  // Bot settings
  bot: {
    environment: process.env.NODE_ENV || 'development',
    activities: [
      'Minecraft',
      'Fortnite',
      'Mindustry',
      'Grand Theft Auto V',
      'Paladins',
      'Pokemon',
      'Deceit',
      'Team Fortress 2',
      'ROBLOX',
      'VALORANT',
      'League of Legends',
      'Amogus',
      'Blue Archive'
    ],
  },
};
