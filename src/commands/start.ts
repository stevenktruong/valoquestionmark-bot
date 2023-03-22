import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import { noLobbyReply } from "checks";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

export default {
    data: new SlashCommandBuilder().setName("start").setDescription("Move teams to their own voice channels"),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
        const lobby = client.lobbies.get(interaction.user.id);
        if (!lobby) return await noLobbyReply(interaction);

        const { teamA, teamB } = lobby.teams;
        if (teamA.players.size == 0 || teamB.players.size == 0) {
            await interaction.reply({
                content: "At least one team doesn't have any players. Run `/balance` to pick teams.",
                ephemeral: true,
            });
            return;
        }

        await interaction.deferReply({ ephemeral: true });
        await lobby.start();
        await interaction.followUp({
            content:
                "Started the lobby successfully! Run `/stop` once you're done to move everyone back to one channel.",
            ephemeral: true,
        });

        await lobby.update();
    },
};
