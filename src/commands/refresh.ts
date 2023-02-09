import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import { noLobbyReply } from "checks";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

export default {
    data: new SlashCommandBuilder().setName("refresh").setDescription("Refresh your customs lobby"),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
        const lobby = client.lobbies.get(interaction.user.id);
        if (!lobby) return await noLobbyReply(interaction);
        await interaction.reply({ content: "Refreshed your lobby", ephemeral: true });
        await lobby.update();
    },
};
