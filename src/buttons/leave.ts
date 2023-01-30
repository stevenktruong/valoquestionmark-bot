import { ButtonInteraction } from "discord.js";

import { parseButtonId } from "buttons";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

export const handleLeave = (interaction: ButtonInteraction) => {
    const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
    const { ownerId } = parseButtonId(interaction.customId);
    const lobby = client.lobbies.get(ownerId);

    if (!lobby.playerManager.hasPlayer(interaction.user)) {
        interaction.reply({ content: "You're not in this lobby", ephemeral: true });
    } else {
        lobby.playerManager.removePlayer(interaction.user);
        interaction.reply({ content: `Left ${lobby.owner.username}'s lobby`, ephemeral: true });
    }
};
