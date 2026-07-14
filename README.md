# Nattochan Discord Bot 🤖

An AI-powered Discord chatbot built with Discord.js, OpenAI, and ChromaDB.

## Features

- 🤖 AI-powered conversations using OpenAI GPT
- 📝 Command system with prefix support
- 🎮 Dynamic status/activity rotation
- 📊 Clean, modular architecture
- 🛠️ Easy command development

## Project Structure

```
nattochan/
├── src/
│   ├── commands/          # Bot commands
│   │   ├── help.js
│   │   ├── ping.js
│   │   └── helloJapanese.js
│   ├── events/            # Discord event handlers
│   │   ├── ready.js
│   │   └── message.js
│   ├── handlers/          # Command & event loaders
│   │   ├── commandHandler.js
│   │   └── eventHandler.js
│   ├── modules/           # Core functionality modules
│   │   └── aiChat.js
│   ├── utils/             # Utility functions
│   │   ├── logger.js
│   │   └── errorHandler.js
│   └── config/            # Configuration
│       └── config.js
├── .env                   # Environment variables (not committed)
├── .env.example          # Environment variables template
├── .gitignore
├── index.js              # Entry point
└── package.json
```

## Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Discord Bot Token ([Get one here](https://discord.com/developers/applications))
- OpenAI API Key ([Get one here](https://platform.openai.com/api-keys))

## Installation

1. **Clone the repository**
   ```bash
   cd nattochan-discord
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` and fill in your credentials:
   ```env
   DISCORD_TOKEN=your_discord_bot_token_here
   DISCORD_CLIENT_ID=your_bot_client_id
   PREFIX=!
   OPENAI_API_KEY=your_openai_api_key_here
   ```

5. **Invite the bot to your server**
   - Go to Discord Developer Portal
   - Select your application
   - Go to OAuth2 → URL Generator
   - Select scopes: `bot`
   - Select permissions: `Send Messages`, `Read Message History`, `Embed Links`, etc.
   - Copy the generated URL and open it in your browser

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Creating Commands

Create a new file in `src/commands/`:

```javascript
module.exports = {
  name: 'commandname',
  description: 'Command description',
  aliases: ['alias1', 'alias2'],
  usage: '[optional] <required>',
  args: false,
  cooldown: 3,
  
  async execute(message, args, client) {
    // Your command logic here
    await message.channel.send('Hello!');
  },
};
```

## Creating Events

Create a new file in `src/events/`:

```javascript
const logger = require('../utils/logger');

module.exports = {
  name: 'eventName',
  once: false, // Set to true if this should only run once
  
  execute(arg1, arg2, client) {
    // Your event logic here
    logger.info('Event triggered!');
  },
};
```

## Available Commands

- `!help [command]` - Display all commands or get info about a specific command
- `!ping` - Check bot latency
- `!こんにちは` - Japanese greeting command

## AI Chat

Mention the bot (@Nattochan) in any message to start an AI conversation:
```
@Nattochan Hello! How are you?
```

## Configuration

Edit `src/config/config.js` to modify:
- Bot activities/status messages
- Default prefix
- Other bot settings

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| DISCORD_TOKEN | Your Discord bot token | Yes |
| DISCORD_CLIENT_ID | Your bot's client ID | Yes |
| PREFIX | Command prefix (default: !) | No |
| OPENAI_API_KEY | OpenAI API key for AI chat | Yes (for AI features) |
| NODE_ENV | Environment (development/production) | No |

## Troubleshooting

### Bot doesn't respond
- Check if the bot is online in Discord
- Verify `DISCORD_TOKEN` is correct
- Check console for errors

### AI chat not working
- Verify `OPENAI_API_KEY` is set correctly
- Check OpenAI API usage limits
- Look for error messages in console

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC

## Author

knilios

---

**Note**: Never commit `.env` to version control. This file contains sensitive credentials. I know, I know, it's a common sense (which I totally have never done that). But for some reason, my CoPilot wrote this.
