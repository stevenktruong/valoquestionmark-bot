import { ChatInputCommandInteraction } from "discord.js";

export const noLobbyReply = async (interaction: ChatInputCommandInteraction) =>
    await interaction.reply({
        content: "You need to have a customs lobby to do that. You can start one with `/create`.",
        ephemeral: true,
    });
