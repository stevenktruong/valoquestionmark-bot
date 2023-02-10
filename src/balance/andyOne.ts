import { ChatInputCommandInteraction } from "discord.js";

import { spawn } from "child_process";

import { makeTeamsFailedReply } from "checks";
import { getMapSelector, getMapSelectorId } from "components/mapSelector";
import { getIdFromPlayer, getPlayerFromId } from "players";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

const pythonPath = "./src/algorithms/env/bin/python";
const scriptPath = "./src/algorithms/acs-predict-score-delta.py";

/**
 * Uses a ML model to predict score differentials based on each player's ACS on each team per map.
 * Use teams that have the smallest predicted score differential using their overall average ACS.
 */
export const handleAndyOne = async (interaction: ChatInputCommandInteraction) => {
    const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
    const lobby = client.lobbies.get(interaction.user.id);

    // Map Discord accounts to the name recognized by the script
    const players = lobby.players.map(member => getPlayerFromId(member.id));
    if (players.length != 10) {
        await interaction.reply({
            content: "This algorithm only works when there are 10 people!",
            ephemeral: true,
        });
        return;
    }

    if (!players.every(player => player != null)) {
        await interaction.reply({
            content: "This algorithm only works for people tracked on the dashboard!",
            ephemeral: true,
        });
        return;
    }

    const message = await interaction.reply({
        content: "Pick the map to balance on:",
        components: [getMapSelector(lobby)],
        ephemeral: true,
    });

    const collector = message.createMessageComponentCollector({
        filter: m => m.customId === getMapSelectorId(lobby),
        max: 1,
    });
    lobby.addBalanceCollector(collector);

    collector.on("end", async collected => {
        const i = collected.first();
        if (!i) {
            // If it didn't collect anything, then the collector ended because the players changed
            await interaction.editReply({
                content:
                    "Canceling since someone joined or left during balancing. You can run `/balance` to try again.",
                components: [],
            });
            return;
        }

        if (!i.isStringSelectMenu()) {
            client.logger.error(
                {
                    interaction: {
                        customId: i.customId,
                        interactionId: i.id,
                        user: i.user.username,
                    },
                },
                "Non-selector interaction had the custom id of a selector."
            );
            return;
        }

        await i.deferUpdate();
        const mapName = i.values[0];
        const python = spawn(pythonPath, [scriptPath, "--balance", mapName, ...players]);
        const { teamANames, teamBNames } = await new Promise<{ teamANames: string[]; teamBNames: string[] }>(
            (resolve, reject) => {
                python.stdout.on("data", data => {
                    const { team_red, team_blue }: { team_red: string[]; team_blue: string[] } = JSON.parse(
                        data.toString("utf8")
                    );
                    resolve({ teamANames: team_red, teamBNames: team_blue });
                });

                python.stderr.on("data", data =>
                    client.logger.warn(data.toString("utf8"), "Error executing `acs-predict-score-delta.py`.")
                );
            }
        );

        const teamAIds = teamANames.map(getIdFromPlayer);
        const teamBIds = teamBNames.map(getIdFromPlayer);

        lobby.resetTeams();
        if (!lobby.makeTeams(teamAIds, teamBIds)) return makeTeamsFailedReply(i);

        await i.editReply({
            content:
                "Teams are picked! Run `/start` to move everyone to their own channel. If you need to make changes to the teams, run `/balance` again.",
            components: [],
        });
        await lobby.update();
    });
};
