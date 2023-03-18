import { Events } from "discord.js";

import dotenv from "dotenv";

import balanceStrategies from "balance";
import buttonHandlers from "buttons";
import commands, { CommandName } from "commands";
import logger from "logger";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

dotenv.config();
const { DISCORD_TOKEN } = process.env;

const client = new ValoQuestionMarkClient(commands, buttonHandlers, balanceStrategies);
client.once(Events.ClientReady, c => {
    client.logger.info(`Ready! Logged in as ${c.user.tag}`);
});

process.on("SIGINT", async () => {
    try {
        await client.cleanup();
    } catch (error) {
        logger.warn(error, "Failed to remove all channels and messages.");
    }
    logger.info("Successfully cleaned up created channels and messages.");
    process.exit();
});

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        const commandName = interaction.commandName as CommandName;
        if (!commandName) {
            logger.info(`Received an invalid slash command: /${commandName}`);
            return;
        }

        const command = commands.get(commandName);
        const commandLogger = client.logger.child({
            guild: interaction.guild.name,
            user: interaction.user.username,
            command: interaction.toString(),
        });

        commandLogger.info("Received a slash command.");

        try {
            await command.execute(interaction);
        } catch (error) {
            commandLogger.error(error);
            await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
        }
    } else if (interaction.isAutocomplete()) {
        const commandName = interaction.commandName as CommandName;
        if (!commandName) {
            logger.info(`Received an invalid autocomplete request: /${commandName}`);
            return;
        }

        const command = client.commands.get(commandName);
        const autocompleteLogger = client.logger.child({
            guild: interaction.guild.name,
            user: interaction.user.username,
            command: `/${interaction.commandName}`,
        });

        try {
            await command.autocomplete(interaction);
        } catch (error) {
            autocompleteLogger.error(error);
        }
    }
});

client.login(DISCORD_TOKEN);
