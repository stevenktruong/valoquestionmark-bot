# valo? bot

A Discord bot to help manage customs games in a private server.

## Setup

This project uses `yarn` to manage dependencies.

### `.env`

Provides API keys, IDs, secrets, etc. from Discord needed for the bot to run properly. This file should never be committed to the repo.

```
DISCORD_TOKEN=...
CLIENT_ID=...
GUILD_ID=...
SECRET=...
```

### Python

Currently, the only Python scripts are in `src/algorithms`. Virtual environments need to be set up within those folders (they aren't included in the repo). The `requirements.txt` file is included for dependencies.

#### `acs-predict-score-delta`

This balancing algorithm needs to be trained. You can run

```sh
src/algorithms/env/bin/python src/algorithms/acs-predict-score-delta.py --train
```

to do so. Afterwards, you can run the balancing algorithm manually via

```sh
src/algorithms/env/bin/python src/algorithms/acs-predict-score-delta.py --balance [10 PLAYERS TO BALANCE]
```

See `src/balance/andyOne.ts` for an example of how this script is called. After proper setup, the directory should look like:

```
src/algorithms
|- env
|- models
    |- acs-predict-score-delta.json
|- acs-predict-score-delta.py
|- constants.py
|- requirements.txt
```

## Development

| Command       | Description                       |
| :------------ | :-------------------------------- |
| `yarn start`  | Runs a local instance of the bot  |
| `yarn deploy` | Deploy slash commands to a server |
