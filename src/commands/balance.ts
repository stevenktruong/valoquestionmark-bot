import { ChatInputCommandInteraction, SlashCommandBuilder, Snowflake } from "discord.js";

import { getTeamSelector, getTeamSelectorId } from "components/teamSelector";
import { LobbyState } from "types/Lobby";
import { TeamLabel } from "types/PlayerManager";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

const STRATEGY = "strategy";

export enum BalanceStrategy {
    OwnerPick = "OwnerPick",
}

export default {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Start picking teams in your lobby")
        .addStringOption(option =>
            option
                .setName(STRATEGY)
                .setDescription("?")
                .addChoices({
                    name: "Pick manually",
                    value: BalanceStrategy.OwnerPick as string,
                })
                .setRequired(true)
        ),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
        const lobby = client.lobbies.get(interaction.user.id);
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

        const message = await interaction.reply({
            content: "Pick the attacking team:",
            components: [getTeamSelector(lobby)],
            ephemeral: true,
        });

        await message.awaitMessageComponent({ filter: m => m.customId === getTeamSelectorId(lobby) }).then(async i => {
            if (!i.isStringSelectMenu()) {
                console.error("Selector filter picked up a non-selector interaction");
                return;
            }

            lobby.playerManager.resetTeams();
            const selection = i.values;
            lobby.playerManager.players.forEach((member, id) => {
                if (selection.includes(id)) {
                    lobby.playerManager.moveToTeam(member, TeamLabel.TeamA);
                } else {
                    lobby.playerManager.moveToTeam(member, TeamLabel.TeamB);
                }
            });

            await i.update({
                content:
                    "Teams are picked! Run `/start` to move everyone to their own channel. If you need to make changes to the teams, run `/balance` again.",
                components: [],
            });
            await lobby.update();
        });
    },
};
