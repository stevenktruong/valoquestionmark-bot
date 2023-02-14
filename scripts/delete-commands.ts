import { REST, Routes } from "discord.js";

import dotenv from "dotenv";

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

(async () => {
    try {
        console.log(`Attempting to remove all deployed commands.`);
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
            body: [],
        });
        console.log(`Successfully removed all commands.`);
    } catch (error) {
        console.error(error);
    }
})();
