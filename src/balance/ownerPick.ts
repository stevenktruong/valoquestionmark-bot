import { ChatInputCommandInteraction } from "discord.js";

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

    await message.awaitMessageComponent({ filter: m => m.customId === getTeamSelectorId(lobby) }).then(async i => {
        if (!i.isStringSelectMenu()) {
            client.logger.error(
                {
                    interaction: {
                        customId: i.customId,
                        interactionId: i.id,
                        user: interaction.user.username,
                    },
                },
                "Non-selector interaction had the custom id of a selector."
            );
            return;
        }

        lobby.resetTeams();
        const playerIdsA = i.values;
        const playerIdsB = lobby.players.filter(member => !i.values.includes(member.id)).map(member => member.id);
        lobby.makeTeams(playerIdsA, playerIdsB);

        await i.update({
            content:
                "Teams are picked! Run `/start` to move everyone to their own channel. If you need to make changes to the teams, run `/balance` again.",
            components: [],
        });
        await lobby.update();
    });
};
