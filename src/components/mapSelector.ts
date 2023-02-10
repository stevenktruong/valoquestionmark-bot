import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";

import { valorantMapList } from "maps";

import { Lobby } from "types/Lobby";

export const getMapSelectorId = (lobby: Lobby) => `${lobby.owner.id}-mapselector`;
export const parseMapSelectorId = (customId: string) => ({ ownerId: customId.split("-")[0] });

export const getMapSelector = (lobby: Lobby) =>
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(getMapSelectorId(lobby))
            .setPlaceholder("Select map")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(
                valorantMapList.map(mapName => ({
                    label: mapName,
                    value: mapName,
                }))
            )
    );
