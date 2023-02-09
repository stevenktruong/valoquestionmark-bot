import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import { noLobbyReply } from "checks";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

export default {
    data: new SlashCommandBuilder().setName("swap").setDescription("Swap the teams in your lobby"),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
        const lobby = client.lobbies.get(interaction.user.id);
        if (!lobby) return await noLobbyReply(interaction);

        lobby.swapTeams();

        await interaction.reply({ content: "Swapped teams in your lobby!", ephemeral: true });
        await lobby.update();
    },
};
