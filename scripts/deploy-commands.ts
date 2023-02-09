import { REST, RESTPutAPIApplicationGuildCommandsResult, Routes } from "discord.js";

import dotenv from "dotenv";

import commands from "commands";

dotenv.config();
const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN) {
    console.error("Missing DISCORD_TOKEN from .env file");
    process.exit(1);
}

if (!CLIENT_ID) {
    console.error("Missing CLIENT_ID from .env file");
    process.exit(1);
}

if (!GUILD_ID) {
    console.error("Missing GUILD_ID from .env file");
    process.exit(1);
}

const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);
const commandsJson = commands.map(command => command.data.toJSON());

(async () => {
    try {
        console.log(`Attempting to refresh ${commandsJson.length} command(s).`);
        const data = (await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
            body: commandsJson,
        })) as RESTPutAPIApplicationGuildCommandsResult;
        console.log(`Successfully reloaded ${data.length} command(s).`);
    } catch (error) {
        console.error(error);
    }
})();
