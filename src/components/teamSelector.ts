import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";

import { Lobby, MAX_TEAM_SIZE } from "types/Lobby";
import { TeamLabel } from "types/PlayerManager";

export const getTeamSelectorId = (lobby: Lobby) => `${lobby.owner.id}-teamselector`;
export const parseTeamSelectorId = (customId: string) => ({ ownerId: customId.split("-")[0] });

export const getTeamSelector = (lobby: Lobby) =>
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(getTeamSelectorId(lobby))
            .setPlaceholder("Select players")
            .setMinValues(MAX_TEAM_SIZE)
            .setMaxValues(MAX_TEAM_SIZE)
            .addOptions(
                lobby.playerManager.players.map(member => ({
                    label: member.displayName,
                    default: (lobby.playerManager.teamOf(member) === TeamLabel.TeamA) as boolean,
                    value: member.id,
                }))
            )
    );
