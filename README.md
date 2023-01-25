# valo? bot

A Discord bot to help manage customs games in a private server.

## Configuration

### `.env`

Provides API keys, IDs, secrets, etc. needed for the bot to run properly. This file should never be committed to the repo.

```
DISCORD_TOKEN=...
CLIENT_ID=...
GUILD_ID=...
SECRET=...
```

## Development

| Command       | Description                       |
| :------------ | :-------------------------------- |
| `yarn start`  | Runs a local instance of the bot  |
| `yarn deploy` | Deploy slash commands to a server |
