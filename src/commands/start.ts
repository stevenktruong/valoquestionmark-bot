import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

export default {
    data: new SlashCommandBuilder().setName("start").setDescription("Move teams to their own voice channels"),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
        const lobby = client.lobbies.get(interaction.user.id);
        if (!lobby) {
            await interaction.reply({ content: "You don't have a customs lobby", ephemeral: true });
            return;
        }

        const { teamA, teamB } = lobby.getTeams();
        if (teamA.players.size == 0 || teamB.players.size == 0) {
            await interaction.reply({
                content: "At least one team doesn't have any players. Run `/balance` to pick teams.",
                ephemeral: true,
            });
            return;
        }

        await lobby.start();
        await interaction.reply({
            content:
                "Started the lobby successfully! Run `/stop` once you're done to move everyone back to one channel.",
            ephemeral: true,
        });

        await lobby.update();
    },
};
