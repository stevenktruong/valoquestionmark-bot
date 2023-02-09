import { ChatInputCommandInteraction } from "discord.js";

import { spawn } from "child_process";

import { makeTeamsFailedReply } from "checks";
import { getIdFromPlayer, getPlayerFromId } from "players";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

const pythonPath = "./src/algorithms/env/bin/python";
const scriptPath = "./src/algorithms/acs-predict-score-delta.py";

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

    await interaction.deferReply({ ephemeral: true });

    const python = spawn(pythonPath, [scriptPath, "--balance", ...players]);
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
    if (!lobby.makeTeams(teamAIds, teamBIds)) return makeTeamsFailedReply(interaction);

    await interaction.followUp({
        content:
            "Teams are picked! Run `/start` to move everyone to their own channel. If you need to make changes to the teams, run `/balance` again.",
        ephemeral: true,
    });
    await lobby.update();
};
