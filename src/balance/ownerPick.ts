import { ChatInputCommandInteraction } from "discord.js";

import { getTeamSelector, getTeamSelectorId } from "components/teamSelector";
import { TeamLabel } from "types/Lobby";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

export const handleOwnerPick = async (interaction: ChatInputCommandInteraction) => {
    const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
    const lobby = client.lobbies.get(interaction.user.id);
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

        lobby.resetTeams();
        const selection = i.values;
        lobby.players.forEach((member, id) => {
            if (selection.includes(id)) {
                lobby.moveToTeam(member, TeamLabel.TeamA);
            } else {
                lobby.moveToTeam(member, TeamLabel.TeamB);
            }
        });

        await i.update({
            content:
                "Teams are picked! Run `/start` to move everyone to their own channel. If you need to make changes to the teams, run `/balance` again.",
            components: [],
        });
        await lobby.update();
    });
};
