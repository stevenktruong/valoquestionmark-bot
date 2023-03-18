import { ActionRowBuilder, GuildMember, StringSelectMenuBuilder } from "discord.js";

import { Lobby } from "types/Lobby";

export const getDraftSelectorId = (lobby: Lobby, captain: GuildMember) =>
    `${lobby.owner.id}-${captain.id}-captainselector`;
export const parseDraftSelectorId = (customId: string) => ({ ownerId: customId.split("-")[1] });

export const getDraftSelector = (lobby: Lobby, captain: GuildMember, remainingPlayers: GuildMember[], n: number) =>
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(getDraftSelectorId(lobby, captain))
            .setPlaceholder(`Select ${n} player${n > 1 ? "s" : ""}`)
            .setMinValues(n)
            .setMaxValues(n)
            .addOptions(
                remainingPlayers.map(member => ({
                    label: member.displayName,
                    value: member.id,
                }))
            )
    );
