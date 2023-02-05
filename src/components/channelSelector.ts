import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";

import { Lobby } from "types/Lobby";

export const getChannelSelectorId = (lobby: Lobby) => `${lobby.owner.id}-channelselector`;
export const parseChannelSelectorId = (customId: string) => ({ ownerId: customId.split("-")[0] });

export const getChannelSelector = (lobby: Lobby) =>
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(getChannelSelectorId(lobby))
            .setPlaceholder("Select voice channel")
            .addOptions(
                lobby.guild.channels.cache
                    .filter(channel => channel.isVoiceBased() && !lobby.channelIds.includes(channel.id))
                    .map(channel => ({
                        label: channel.name,
                        value: channel.id,
                    }))
            )
    );
