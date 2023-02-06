# valo? bot

A Discord bot to help manage customs games in a private server.

## Setup

This project uses `yarn` to manage dependencies.

### `.env`

Provides API keys, IDs, secrets, etc. needed for the bot to run properly. This file should never be committed to the repo.

```
DISCORD_TOKEN=...
CLIENT_ID=...
GUILD_ID=...
SECRET=...
```

### Python

Currently, the only Python scripts are in `src/balance`. Virtual environments need to be set up within those folders (they aren't included in the repo). The `requirements.txt` file is included.

| Python Script     | Virtual Environment |
| :---------------- | :------------------ |
| `team-synergy.py` | `team-synergy-env`  |

## Development

| Command       | Description                       |
| :------------ | :-------------------------------- |
| `yarn start`  | Runs a local instance of the bot  |
| `yarn deploy` | Deploy slash commands to a server |
