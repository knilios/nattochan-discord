# Quick Start Guide

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy the example environment file
copy .env.example .env
```

Edit `.env` and add your credentials:
- `DISCORD_TOKEN` - Get from [Discord Developer Portal](https://discord.com/developers/applications)
- `OPENAI_API_KEY` - Get from [OpenAI Platform](https://platform.openai.com/api-keys)

### 3. Run the Bot
```bash
# Development (with auto-restart)
npm run dev

# Or production
npm start
```

## Your First Command

Try these commands in Discord:
- `!help` - See all commands
- `!ping` - Check bot latency
- `!info` - View bot information
- `@Nattochan hello` - Chat with AI

## Creating a New Command

1. Copy `src/commands/_template.js`
2. Rename it (e.g., `mycommand.js`)
3. Edit the command properties and logic
4. Restart the bot - it will auto-load!

Example:
```javascript
module.exports = {
  name: 'greet',
  description: 'Greet a user',
  async execute(message, args, client) {
    await message.channel.send(`Hello ${message.author}!`);
  },
};
```

## Next Steps

- Read the full [README.md](README.md)
- Explore existing commands in `src/commands/`
- Check out event handlers in `src/events/`
- Customize activities in `src/config/config.js`

## Troubleshooting

**Bot offline?**
- Check console for errors
- Verify `DISCORD_TOKEN` in `.env`

**Commands not working?**
- Make sure you're using the correct prefix (default: `!`)
- Check the bot has permissions in your server

**Need help?**
- Check the console logs
- Review error messages carefully
- Ensure all dependencies are installed
