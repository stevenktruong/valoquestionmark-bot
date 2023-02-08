import { EmbedBuilder } from "discord.js";

import { Lobby, LobbyState, MAX_LOBBY_SIZE } from "types/Lobby";

export const getLobbyStatus = (lobby: Lobby) => {
    const { teamA, teamB } = lobby.teams;

    return new EmbedBuilder()
        .setColor("#fb0e42")
        .setThumbnail("https://raw.githubusercontent.com/candysan7/valorant-customs-stats/main/home-page/logo-v3.png")
        .setTitle("valo?")
        .setURL("https://github.com/stevenktruong/valoquestionmark-bot")
        .setAuthor({
            name: `${lobby.owner.displayName}`,
            iconURL: lobby.owner.displayAvatarURL(),
        })
        .setDescription(
            (() => {
                if (lobby.state !== LobbyState.Playing) {
                    return lobby.isFull() ? "Lobby is full." : "Click `Join` to join the lobby.";
                } else {
                    return "Lobby is in-game.";
                }
            })()
        )
        .addFields(
            ...(lobby.state === LobbyState.Balanced
                ? [
                      {
                          name: "🗡️ Attackers",
                          value:
                              teamA.players.size > 0
                                  ? teamA.players.map(member => `${member.displayName}`).join("\n")
                                  : "\u200b",
                          inline: true,
                      },
                      {
                          name: "🛡️ Defenders",
                          value:
                              teamB.players.size > 0
                                  ? teamB.players.map(member => `${member.displayName}`).join("\n")
                                  : "\u200b",
                          inline: true,
                      },
                  ]
                : [
                      {
                          name: `👥 Players (${lobby.size}/${MAX_LOBBY_SIZE})`,
                          value: lobby.size > 0 ? lobby.players.map(member => member.displayName).join("\n") : "\u200b",
                      },
                  ]),
            {
                name: "\u200b",
                value: "🤓👉 [Dashboard](https://www.valoquestionmark.com/)",
            }
        )
        .setTimestamp();
};
