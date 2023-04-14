import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder, Snowflake } from "discord.js";

import { noLobbyReply } from "checks";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

const PLAYER = "player";

export default {
    data: new SlashCommandBuilder()
        .setName("add")
        .setDescription("Add a player to your customs lobby")
        .addStringOption(option =>
            option.setName(PLAYER).setDescription("Player to add").setAutocomplete(true).setRequired(true)
        ),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
        const lobby = client.lobbies.get(interaction.user.id);
        if (!lobby) return await noLobbyReply(interaction);

        const id = interaction.options.get(PLAYER, true).value as Snowflake;
        const member = lobby.guild.members.cache.get(id);
        if (!member) {
            await interaction.reply({
                content: "That member isn't in your server!",
                ephemeral: true,
            });
            return;
        }

        if (member.user.bot) {
            await interaction.reply({
                content: "You can't add bots to your lobby!",
                ephemeral: true,
            });
            return;
        }

        await lobby.addPlayer(member);
        await interaction.reply({
            content: `Added <@${member.id}> to the lobby.`,
            ephemeral: true,
        });

        await lobby.update();
    },
    autocomplete: async (interaction: AutocompleteInteraction) => {
        const focusedValue = interaction.options.getFocused();
        await interaction.respond(
            interaction.guild.members.cache
                .filter(member => !member.user.bot)
                .filter(member => member.displayName.startsWith(focusedValue))
                .map(member => ({
                    name: member.displayName,
                    value: member.id,
                }))
                .slice(0, 25) // 25 is the limit for autocomplete lists
        );
    },
};
