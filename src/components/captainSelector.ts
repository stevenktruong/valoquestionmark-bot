import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";

import { Lobby } from "types/Lobby";

export const getCaptainSelectorId = (lobby: Lobby) => `${lobby.owner.id}-captainselector`;
export const parseCaptainSelectorId = (customId: string) => ({ ownerId: customId.split("-")[0] });

export const getCaptainSelector = (lobby: Lobby) =>
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(getCaptainSelectorId(lobby))
            .setPlaceholder("Select team captains")
            .setMinValues(2)
            .setMaxValues(2)
            .addOptions(
                lobby.players.map(member => ({
                    label: member.displayName,
                    value: member.id,
                }))
            )
    );
