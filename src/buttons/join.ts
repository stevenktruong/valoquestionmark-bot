import { ButtonInteraction, GuildMember, Snowflake } from "discord.js";

import { parseButtonId } from "components/lobbyButtons";
import { discordIdToPlayer } from "players";
import { LobbyState, MAX_LOBBY_SIZE } from "types/Lobby";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

export const handleJoin = async (interaction: ButtonInteraction) => {
    const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
    const { ownerId } = parseButtonId(interaction.customId);
    const lobby = client.lobbies.get(ownerId);

    const member = interaction.member as GuildMember;
    const dummies = Object.entries(discordIdToPlayer)
        .slice(0, 9)
        .map(
            ([id, player]) =>
                ({
                    ...member,
                    id: id,
                    displayName: player,
                } as GuildMember)
        );

    if (!lobby.hasPlayer(member)) {
        if (lobby.players.size === MAX_LOBBY_SIZE) {
            await interaction.reply({ content: "This lobby is full", ephemeral: true });
            return;
        }

        for (const dummy of dummies) {
            lobby.addPlayer(dummy);
        }
        lobby.addPlayer(member);
    }
    await interaction.deferUpdate();
};
