import { ChatInputCommandInteraction } from "discord.js";

import { updateTeamsFailedReply } from "checks";
import { getMapSelector, getMapSelectorId } from "components/mapSelector";
import { getIdFromPlayer, getPlayerFromId } from "players";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

import individualData from "data/individual.json";

const draftOrder = [1, 1, 1, 2, 2, 2, 1];

/**
 * Snake draft based on the average ACS of a player on the chosen map.
 */
export const handleAndyThree = async (interaction: ChatInputCommandInteraction) => {
    const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
    const lobby = client.lobbies.get(interaction.user.id);

    // Map Discord accounts to the name recognized by the script
    const players = lobby.players.map(member => getPlayerFromId(member.id));
    if (players.length != 10) {
        await interaction.reply({
            content: "This algorithm only works when there are 10 people!",
            ephemeral: true,
        });
        return;
    }

    if (!players.every(player => player != null)) {
        await interaction.reply({
            content: "This algorithm only works for people tracked on the dashboard!",
            ephemeral: true,
        });
        return;
    }

    const message = await interaction.reply({
        content: "Pick the map to balance on:",
        components: [getMapSelector(lobby)],
        ephemeral: true,
    });

    const collector = message.createMessageComponentCollector({
        filter: m => m.customId === getMapSelectorId(lobby),
        max: 1,
    });
    lobby.addBalanceCollector(collector);

    collector.on("end", async collected => {
        const i = collected.first();
        if (!i) {
            // If it didn't collect anything, then the collector ended because the players changed
            await interaction.editReply({
                content: "Canceling either because players changed or you ran `/balance` again.",
                components: [],
            });
            return;
        }

        if (!i.isStringSelectMenu()) {
            client.logger.error(
                {
                    interaction: {
                        customId: i.customId,
                        interactionId: i.id,
                        user: interaction.user.username,
                    },
                },
                "Non-selector interaction had the custom id of a selector."
            );
            return;
        }

        await i.deferUpdate();
        const mapName = i.values[0];
        const teamAIds = [];
        const teamBIds = [];

        // Increasing in ACS (so last entry is the top player)
        const sortedPlayerIds = players
            .sort((a, b) => individualData[a]["maps"][mapName]["acs"] - individualData[b]["maps"][mapName]["acs"])
            .map(getIdFromPlayer);
        draftOrder.forEach((n, i) => {
            const nextPlayers = sortedPlayerIds.splice(-n, n);
            if (i % 2 == 0) {
                teamAIds.push(...nextPlayers);
            } else {
                teamBIds.push(...nextPlayers);
            }
        });

        lobby.resetTeams();
        if (!lobby.updateTeams(teamAIds, teamBIds)) return updateTeamsFailedReply(i);

        await i.editReply({
            content:
                "Teams are picked! Run `/start` to move everyone to their own channel. If you need to make changes to the teams, run `/balance` again.",
            components: [],
        });
        await lobby.update();
    });
};
