import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import { noLobbyReply } from "checks";
import { LobbyState } from "types/Lobby";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

export default {
    data: new SlashCommandBuilder().setName("archive").setDescription("Archive your customs lobby"),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
        const lobby = client.lobbies.get(interaction.user.id);
        if (!lobby) return await noLobbyReply(interaction);

        if (lobby.state === LobbyState.Playing) {
            await interaction.reply({
                content: "You can't archive your lobby while a game is in progress",
                ephemeral: true,
            });
            return;
        }

        client.archiveLobby(lobby);

        await interaction.reply({
            content: "Successfully archived your lobby. Run `/create` again to create a new one.",
            ephemeral: true,
        });
    },
};
