import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder, Snowflake } from "discord.js";

import { noLobbyReply } from "checks";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

const PLAYER = "player";

export default {
    data: new SlashCommandBuilder()
        .setName("remove")
        .setDescription("Remove a player from your customs lobby")
        .addStringOption(option =>
            option.setName(PLAYER).setDescription("Player to remove").setAutocomplete(true).setRequired(true)
        ),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
        const lobby = client.lobbies.get(interaction.user.id);
        if (!lobby) return noLobbyReply(interaction);

        const id = interaction.options.get(PLAYER, true).value as Snowflake;
        const player = lobby.getPlayer(id);
        if (!player) {
            await interaction.reply({
                content: "That player isn't in your lobby!",
                ephemeral: true,
            });
            return;
        }

        await lobby.removePlayer(player);
        await interaction.reply({
            content: `Kicked <@${player.id}> from the lobby.`,
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

        const focusedValue = interaction.options.getFocused();
        await interaction.respond(
            lobby.players
                .filter(member => member.displayName.startsWith(focusedValue))
                .map(member => ({
                    name: member.displayName,
                    value: member.id,
                }))
        );
    },
};
