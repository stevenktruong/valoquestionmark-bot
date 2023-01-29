import { Events } from "discord.js";

import dotenv from "dotenv";

import commands from "./commands";
import { ValoQuestionMarkClient } from "./types/ValoQuestionMarkClient";

dotenv.config();
const { DISCORD_TOKEN } = process.env;

const client = new ValoQuestionMarkClient(commands);
client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Handle commands
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
    }
});

client.login(DISCORD_TOKEN);
