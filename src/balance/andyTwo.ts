import { ChatInputCommandInteraction } from "discord.js";

import { getIdFromPlayer, getPlayerFromId, Player } from "players";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

const playerRanks = {
    [Player.Andy]: 3,
    [Player.Brandon]: 15,
    [Player.Brian]: 14,
    [Player.Cade]: 5,
    [Player.Darwin]: 7,
    [Player.Josh]: 9,
    [Player.Lindsey]: 6,
    [Player.Sequential]: 1,
    [Player.Sophie]: 11,
    [Player.Steve]: 10,
    [Player.Steven]: 2,
    [Player.Sun]: 8,
    [Player.Susi]: 12,
    [Player.Susu]: 13,
    [Player.Tang]: 4,
    [Player.Yang]: 16,
};

const draftOrder = [1, 1, 1, 2, 2, 2, 1];

export const handleAndyTwo = async (interaction: ChatInputCommandInteraction) => {
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

    const teamAIds = [];
    const teamBIds = [];

    // Decreasing in rank (so last entry is the top player)
    const sortedPlayerIds = players
        .sort((a, b) => playerRanks[b] - playerRanks[a])
        .map(player => getIdFromPlayer(player));
    draftOrder.forEach((n, i) => {
        const nextPlayers = sortedPlayerIds.splice(-n, n);
        if (i % 2 == 0) {
            teamAIds.push(...nextPlayers);
        } else {
            teamBIds.push(...nextPlayers);
        }
    });

    lobby.resetTeams();
    lobby.makeTeams(teamAIds, teamBIds);

    await interaction.reply({
        content:
            "Teams are picked! Run `/start` to move everyone to their own channel. If you need to make changes to the teams, run `/balance` again.",
        ephemeral: true,
    });
    await lobby.update();
};
