import {
    ChannelType,
    ChatInputCommandInteraction,
    GuildMember,
    GuildTextBasedChannel,
    SlashCommandBuilder,
} from "discord.js";

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
        ),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
        const guild = interaction.guild;
        const member = interaction.member as GuildMember;
        const channelId = interaction.options.getChannel(CHANNEL)
            ? interaction.options.getChannel(CHANNEL).id
            : interaction.channelId;
        const channel = (await interaction.guild.channels.fetch(channelId)) as GuildTextBasedChannel;

        const lobby = new Lobby(client, member, guild, channel);

        if (!client.newLobby(member, lobby)) {
            await interaction.reply({
                content: "You already created a lobby. You can archive it with `/archive` or delete it with `/delete`.",
                ephemeral: true,
            });
            return;
        }
        await lobby.addPlayer(member);

        await interaction.reply({
            content:
                "Successfully created a lobby! If you're not playing, you can leave by clicking the `Leave` button." +
                "\n- Once everyone joins, run `/balance` to pick teams." +
                "\n- You can manually add and remove players with `/add` and `/remove`, respectively." +
                "\n- When you're done, you can run `/archive` to keep the Discord message or `/delete` to delete it.",
            ephemeral: true,
        });
        await lobby.update();
    },
};
