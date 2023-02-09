import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";

import { Lobby, MAX_TEAM_SIZE, TeamLabel } from "types/Lobby";

export const getTeamSelectorId = (lobby: Lobby) => `${lobby.owner.id}-teamselector`;
export const parseTeamSelectorId = (customId: string) => ({ ownerId: customId.split("-")[0] });

export const getTeamSelector = (lobby: Lobby) =>
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(getTeamSelectorId(lobby))
            .setPlaceholder("Select players")
            .setMinValues(1)
            .setMaxValues(MAX_TEAM_SIZE)
            .addOptions(
                lobby.players.map(member => ({
                    label: member.displayName,
                    default: (lobby.teamOf(member) === TeamLabel.TeamA) as boolean,
                    value: member.id,
                }))
            )
    );
