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
    client.logger.info(`Ready! Logged in as ${c.user.tag}`);
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
        const commandLogger = client.logger.child({
            guild: interaction.guild.name,
            user: interaction.user.username,
            command: interaction.toString(),
        });
        if (!command) {
            commandLogger.warn("Received an invalid slash command.");
            return;
        }

        commandLogger.info("Received a slash command.");

        try {
            await command.execute(interaction);
        } catch (error) {
            commandLogger.error(error);
            await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
        }
    } else if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        const autocompleteLogger = client.logger.child({
            guild: interaction.guild.name,
            user: interaction.user.username,
            command: `/${interaction.commandName}`,
        });

        if (!command) {
            autocompleteLogger.info("Received an invalid autocomplete request.");
            return;
        }

        autocompleteLogger.info("Received an autocomplete request.");

        try {
            await command.autocomplete(interaction);
        } catch (error) {
            autocompleteLogger.error(error);
        }
    }
});

client.login(DISCORD_TOKEN);
