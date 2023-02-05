import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

export default {
    data: new SlashCommandBuilder().setName("refresh").setDescription("Refresh your customs lobby"),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
        const lobby = client.lobbies.get(interaction.user.id);
        if (!lobby) {
            interaction.reply({
                content: "You don't have a customs lobby",
                ephemeral: true,
            });
            return;
        }
        interaction.reply({ content: "Refreshed your lobby", ephemeral: true });
        await lobby.update();
    },
};
