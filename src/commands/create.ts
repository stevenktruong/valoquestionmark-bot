import { ChannelType, ChatInputCommandInteraction, GuildTextBasedChannel, SlashCommandBuilder } from "discord.js";

import { Lobby } from "types/Lobby";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

const CHANNEL = "channel";

export default {
    data: new SlashCommandBuilder()
        .setName("create")
        .setDescription("Create a customs lobby")
        .addChannelOption(option =>
            option
                .setName(CHANNEL)
                .setDescription("The channel to host the lobby in")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
        const channelId = interaction.options.getChannel(CHANNEL).id;
        const channel = (await interaction.guild.channels.fetch(channelId)) as GuildTextBasedChannel;

        const lobby = new Lobby(interaction.user, channel);

        if (!client.newLobby(interaction.user, lobby)) {
            interaction.reply({ content: "You already created a lobby", ephemeral: true });
            return;
        }

        interaction.reply({ content: "Successfully created a lobby", ephemeral: true });
        lobby.update();
    },
};
