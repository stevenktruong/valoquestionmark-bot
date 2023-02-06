import { ButtonInteraction, GuildMember } from "discord.js";

import { parseButtonId } from "components/lobbyButtons";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

export const handleLeave = async (interaction: ButtonInteraction) => {
    const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
    const member = interaction.member as GuildMember;
    const { ownerId } = parseButtonId(interaction.customId);
    const lobby = client.lobbies.get(ownerId);

    if (lobby.playerManager.hasPlayer(member)) {
        lobby.playerManager.removePlayer(member);
    }
    await interaction.deferUpdate();
};
