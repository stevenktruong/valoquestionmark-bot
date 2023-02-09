import { ChatInputCommandInteraction, StringSelectMenuInteraction } from "discord.js";

export const noLobbyReply = async (interaction: ChatInputCommandInteraction) =>
    await interaction.reply({
        content: "You need to have a customs lobby to do that. You can start one with `/create`.",
        ephemeral: true,
    });

export const makeTeamsFailedReply = async (interaction: ChatInputCommandInteraction | StringSelectMenuInteraction) => {
    const payload = {
        content: "There was an issue making teams. Someone may have joined or left during balancing.",
        ephemeral: true,
    };

    if (interaction.deferred) {
        await interaction.followUp(payload);
    } else if (interaction.replied && interaction.isStringSelectMenu()) {
        await interaction.update(payload);
    } else {
        await interaction.reply(payload);
    }
};
