import { ChatInputCommandInteraction, SlashCommandBuilder, Snowflake } from "discord.js";

import { BalanceStrategy } from "balance";
import { getTeamSelector, getTeamSelectorId } from "components/teamSelector";
import { LobbyState } from "types/Lobby";
import { TeamLabel } from "types/PlayerManager";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

const STRATEGY = "strategy";

export default {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Start picking teams in your lobby")
        .addStringOption(option =>
            option
                .setName(STRATEGY)
                .setDescription("?")
                .addChoices(
                    {
                        name: "Pick attackers manually",
                        value: BalanceStrategy.OwnerPick,
                    },
                    {
                        name: "Andy algorithm 1",
                        value: BalanceStrategy.AndyOne,
                    }
                )
                .setRequired(true)
        ),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
        const lobby = client.lobbies.get(interaction.user.id);
        const balanceStrategy = interaction.options.getString(STRATEGY) as BalanceStrategy;
        if (!lobby) {
            await interaction.reply({
                content: "You don't have a customs lobby",
                ephemeral: true,
            });
            return;
        }

        if (lobby.playerManager.players.size == 0) {
            await interaction.reply({
                content: "Your lobby doesn't have any players",
                ephemeral: true,
            });
            return;
        }

        if (lobby.state !== LobbyState.Waiting) {
            await interaction.reply({
                content: "You can't balance teams while a game is in progress",
                ephemeral: true,
            });
            return;
        }

        const handler = client.balanceStrategies.get(balanceStrategy);
        try {
            handler(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "There was an error while handling this balance strategy!",
                ephemeral: true,
            });
        }

        await lobby.update();
    },
};
