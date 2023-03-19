import { EmbedBuilder } from "discord.js";

import { Lobby, LobbyState, MAX_LOBBY_SIZE, Team } from "types/Lobby";

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
                if (lobby.state === LobbyState.Playing) {
                    return "Lobby is in-game.";
                } else if (lobby.state === LobbyState.Archived) {
                    return `Lobby was archived on ${new Date().toLocaleString("en-us", {
                        timeZone: "America/Los_Angeles",
                    })}.`;
                } else {
                    return lobby.isFull() ? "Lobby is full." : "Click `Join` to join the lobby.";
                }
            })()
        )
        .addFields(
            ...(() => {
                const fields = [];
                if (teamA.size > 0 || teamB.size > 0) {
                    fields.push(teamField(teamA, "🗡️ Attackers"), teamField(teamB, "🛡️ Defenders"));
                }

                if (teamA.size == 0 && teamB.size == 0) {
                    fields.push({
                        name: `👥 Players (${lobby.size}/${MAX_LOBBY_SIZE})`,
                        value: lobby.size > 0 ? lobby.players.map(member => member.displayName).join("\n") : "\u200b",
                    });
                } else if (teamA.size + teamB.size < MAX_LOBBY_SIZE) {
                    fields.push({
                        name: "👥 Remaining Players",
                        value:
                            lobby.size > 0
                                ? lobby.players
                                      .filter(member => !(teamA.players.has(member.id) || teamB.players.has(member.id)))
                                      .map(member => member.displayName)
                                      .join("\n")
                                : "\u200b",
                    });
                }

                fields.push({
                    name: "\u200b",
                    value: "🤓👉 [Dashboard](https://www.valoquestionmark.com/)",
                });

                return fields;
            })()
        )
        .setTimestamp();
};

const teamField = (team: Team, name: string) => ({
    name,
    value:
        team.players.size > 0
            ? team.players
                  .map(member =>
                      team.captain && team.captain.id === member.id
                          ? `${member.displayName} 👑`
                          : `${member.displayName}`
                  )
                  .join("\n")
            : "\u200b",
    inline: true,
});
