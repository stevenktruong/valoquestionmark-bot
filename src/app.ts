import { Events } from "discord.js";

import balanceStrategies from "balance";
import buttonHandlers from "buttons";
import commands from "commands";
import dotenv from "dotenv";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

dotenv.config();
const { DISCORD_TOKEN } = process.env;

const client = new ValoQuestionMarkClient(commands, buttonHandlers, balanceStrategies);
client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

process.on("SIGTERM", async () => {
    try {
        await client.cleanup();
    } catch (error) {
        console.error(`Failed to remove all channels and messages: ${error}`);
    } finally {
        console.log("Successfully cleaned up created channels and messages.");
    }

    process.exit();
});

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
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
    } else if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.autocomplete(interaction);
        } catch (error) {
            console.error(error);
        }
    }
});

client.login(DISCORD_TOKEN);
