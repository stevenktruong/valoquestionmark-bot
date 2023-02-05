import { ButtonInteraction, GuildMember } from "discord.js";

import { parseButtonId } from "components/lobbyButtons";
import { MAX_LOBBY_SIZE } from "types/Lobby";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

export const handleJoin = async (interaction: ButtonInteraction) => {
    const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
    const { ownerId } = parseButtonId(interaction.customId);
    const lobby = client.lobbies.get(ownerId);

    const member = interaction.member as GuildMember;
    const dummies = [];
    for (let i = 1; i < 10; i++) {
        dummies.push({ ...member, id: `${i}`, displayName: `dummy-${i}` } as GuildMember);
    }

    if (!lobby.playerManager.hasPlayer(member)) {
        if (lobby.playerManager.players.size === MAX_LOBBY_SIZE) {
            await interaction.reply({ content: "This lobby is full", ephemeral: true });
            return;
        }

        for (const dummy of dummies) {
            lobby.playerManager.addPlayer(dummy);
        }
        lobby.playerManager.addPlayer(member);
    }
    interaction.deferUpdate();
};
