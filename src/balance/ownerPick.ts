import { ChatInputCommandInteraction } from "discord.js";

import { updateTeamsFailedReply } from "checks";
import { getTeamSelector, getTeamSelectorId } from "components/teamSelector";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

export const handleOwnerPick = async (interaction: ChatInputCommandInteraction) => {
    const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
    const lobby = client.lobbies.get(interaction.user.id);
    const message = await interaction.reply({
        content: "Pick the attacking team:",
        components: [getTeamSelector(lobby)],
        ephemeral: true,
    });

    const collector = message.createMessageComponentCollector({
        filter: m => m.customId === getTeamSelectorId(lobby),
        max: 1,
    });
    lobby.addBalanceCollector(collector);

    collector.on("end", async collected => {
        const i = collected.first();
        if (!i) {
            // If it didn't collect anything, then the collector ended because the players changed or a different balancing strategy was chosen.
            await interaction.editReply({
                content: "Canceling either because players changed or you ran `/balance` again.",
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

        lobby.resetTeams();
        const teamAIds = i.values;
        const teamBIds = lobby.players.filter(member => !i.values.includes(member.id)).map(member => member.id);
        if (!lobby.updateTeams(teamAIds, teamBIds)) {
            await updateTeamsFailedReply(i);
            return;
        }

        await i.update({
            content:
                "Teams are picked! Run `/start` to move everyone to their own channel. If you need to make changes to the teams, run `/balance` again.",
            components: [],
        });
        await lobby.update();
    });
};
