import { ChatInputCommandInteraction, SlashCommandBuilder, VoiceChannel } from "discord.js";

import { getChannelSelector, getChannelSelectorId } from "components/channelSelector";
import { LobbyState } from "types/Lobby";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

const CHANNEL = "channel";

export default {
    data: new SlashCommandBuilder().setName("stop").setDescription("Move everyone back to one channel"),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
        const lobby = client.lobbies.get(interaction.user.id);

        if (!lobby) {
            await interaction.reply({ content: "You don't have a customs lobby", ephemeral: true });
            return;
        }

        if (lobby.state !== LobbyState.Playing) {
            await interaction.reply({ content: "You can't stop a lobby that never started", ephemeral: true });
            return;
        }

        const message = await interaction.reply({
            content: "Select the voice channel to move everyone to:",
            components: [getChannelSelector(lobby)],
        });

        await message
            .awaitMessageComponent({
                filter: m => m.customId === getChannelSelectorId(lobby),
            })
            .then(async i => {
                if (!i.isStringSelectMenu()) {
                    console.error("Message filter picked up a non-string selector interaction");
                    return;
                }

                const channel = await lobby.guild.channels.fetch(i.values[0]);
                if (!channel) {
                    console.error(`Channel with id ${i.values[0]} is invalid`);
                    return;
                }

                if (!channel.isVoiceBased()) {
                    console.error(`Channel ${channel.name} isn't a void channel`);
                    return;
                }

                await lobby.stop(channel as VoiceChannel);
                await i.update({
                    content: "Stopped the lobby successfully!",
                    components: [],
                });

                await lobby.update();
            });
    },
};
