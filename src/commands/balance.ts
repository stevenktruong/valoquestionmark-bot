import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import { BalanceStrategyName } from "balance";
import { noLobbyReply } from "checks";
import { LobbyState } from "types/Lobby";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

const STRATEGY = "strategy";

export default {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Pick teams in your lobby")
        .addStringOption(option =>
            option
                .setName(STRATEGY)
                .setDescription("Method to use to pick teams")
                .addChoices(
                    {
                        name: "Pick attackers manually",
                        value: BalanceStrategyName.OwnerPick,
                    },
                    {
                        name: "Pick team captains",
                        value: BalanceStrategyName.DraftPick,
                    },
                    {
                        name: "Predicted ACS synergy by map",
                        value: BalanceStrategyName.AndyOne,
                    },
                    {
                        name: "Automatic snake draft (based on impact)",
                        value: BalanceStrategyName.AndyTwo,
                    },
                    {
                        name: "Automatic snake draft (based on map ACS)",
                        value: BalanceStrategyName.AndyThree,
                    }
                )
                .setRequired(true)
        ),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
        const lobby = client.lobbies.get(interaction.user.id);
        const balanceStrategy = interaction.options.getString(STRATEGY) as BalanceStrategyName;
        if (!lobby) return await noLobbyReply(interaction);

        if (lobby.size == 0) {
            await interaction.reply({
                content: "Your lobby doesn't have any players to balance!",
                ephemeral: true,
            });
            return;
        }

        if (lobby.state === LobbyState.Playing) {
            await interaction.reply({
                content: "You can't balance teams while a game is in progress!",
                ephemeral: true,
            });
            return;
        }

        await lobby.resetBalancing();

        const handler = client.balanceStrategies.get(balanceStrategy);
        try {
            await handler(interaction);
        } catch (error) {
            client.logger.error(error);
            await interaction.reply({
                content: "There was an error while handling this balance strategy!",
                ephemeral: true,
            });
        }

        await lobby.update();
    },
};
