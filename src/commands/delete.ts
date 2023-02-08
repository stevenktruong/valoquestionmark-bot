import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import { noLobby } from "checks";
import { LobbyState } from "types/Lobby";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

export default {
    data: new SlashCommandBuilder().setName("delete").setDescription("Delete your customs lobby"),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
        const lobby = client.lobbies.get(interaction.user.id);
        if (!lobby) return await noLobby(interaction);

        if (lobby.state === LobbyState.Playing) {
            await interaction.reply({
                content: "You can't delete your lobby while a game is in progress",
                ephemeral: true,
            });
            return;
        }

        await lobby.destroy();
        client.lobbies.delete(interaction.user.id);

        await interaction.reply({
            content: "Successfully deleted your lobby. Run `/create` again to create a new one.",
            ephemeral: true,
        });
    },
};
