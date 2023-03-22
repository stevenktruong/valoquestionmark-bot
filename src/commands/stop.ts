import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    Snowflake,
    VoiceChannel,
} from "discord.js";

import { noLobbyReply } from "checks";
import { LobbyState } from "types/Lobby";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

const CHANNEL = "channel";

export default {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Move everyone back to one channel")
        .addStringOption(option =>
            option
                .setName(CHANNEL)
                .setDescription("Voice channel to move everyone to")
                .setAutocomplete(true)
                .setRequired(true)
        ),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
        const lobby = client.lobbies.get(interaction.user.id);
        if (!lobby) return noLobbyReply(interaction);

        if (lobby.state !== LobbyState.Playing) {
            await interaction.reply({ content: "You can't stop a lobby that never started!", ephemeral: true });
            return;
        }

        const channelId = interaction.options.get(CHANNEL, true).value as Snowflake;
        const channel = lobby.guild.channels.cache.get(channelId);
        if (!channel.isVoiceBased()) {
            await interaction.reply({
                content: "You can only move players to a voice channel!",
                ephemeral: true,
            });
            return;
        }

        await interaction.deferReply({ ephemeral: true });
        await lobby.stop(channel as VoiceChannel);
        await interaction.followUp({
            content: "Stopped the lobby successfully!",
            ephemeral: true,
        });

        await lobby.update();
    },
    autocomplete: async (interaction: AutocompleteInteraction) => {
        const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
        const lobby = client.lobbies.get(interaction.user.id);
        if (!lobby) {
            await interaction.respond([]);
            return;
        }

        const guild = interaction.guild;
        await interaction.respond(
            guild.channels.cache
                .filter(channel => channel.isVoiceBased() && !lobby.channelIds.includes(channel.id))
                .map(channel => ({
                    name: channel.name,
                    value: channel.id,
                }))
        );
    },
};
