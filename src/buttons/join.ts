import { ButtonInteraction, GuildMember } from "discord.js";

import { parseButtonId } from "components/lobbyButtons";
import { discordIdToPlayer } from "players";
import { MAX_LOBBY_SIZE } from "types/Lobby";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

export const handleJoin = async (interaction: ButtonInteraction) => {
    const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
    const { ownerId } = parseButtonId(interaction.customId);
    const lobby = client.lobbies.get(ownerId);

    const member = interaction.member as GuildMember;
    if (!lobby.hasPlayer(member)) {
        if (lobby.size === MAX_LOBBY_SIZE) {
            await interaction.reply({ content: "This lobby is full", ephemeral: true });
            return;
        }
        lobby.addPlayer(member);

        // Dummy users for testing
        if (ownerId === "120048657679646720" && lobby.guild.id === "811846013656367174") {
            const dummies = Object.entries(discordIdToPlayer)
                .slice(0, 9)
                .map(
                    ([id, player]) =>
                        ({
                            ...member,
                            id: id,
                            displayName: player,
                            voice: null,
                        } as GuildMember)
                );
            for (const dummy of dummies) {
                lobby.addPlayer(dummy);
            }
        }
    }
    await interaction.deferUpdate();
};
