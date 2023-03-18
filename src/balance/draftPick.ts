import { ChatInputCommandInteraction, ComponentType, GuildMember, Snowflake } from "discord.js";

import { updateTeamsFailedReply } from "checks";
import { getCaptainSelector, getCaptainSelectorId } from "components/captainSelector";
import { getDraftSelector, getDraftSelectorId } from "components/draftSelector";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

const draftOrder = [1, 2, 2, 2, 1];

export const handleDraftPick = async (interaction: ChatInputCommandInteraction) => {
    const client: ValoQuestionMarkClient = interaction.client as ValoQuestionMarkClient;
    const lobby = client.lobbies.get(interaction.user.id);
    if (lobby.players.length != 10) {
        await interaction.reply({
            content: "You can only draft pick when there are 10 people!",
            ephemeral: true,
        });
        return;
    }

    lobby.resetTeams();

    const message = await interaction.reply({
        content: "Pick the team captains:",
        components: [getCaptainSelector(lobby)],
        ephemeral: true,
    });

    const captainCollector = message.createMessageComponentCollector({
        filter: m => m.customId === getCaptainSelectorId(lobby),
        max: 1,
    });
    lobby.addBalanceCollector(captainCollector);

    captainCollector.on("end", async collected => {
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
                        user: interaction.user.username,
                    },
                },
                "Non-selector interaction had the custom id of a selector."
            );
            return;
        }

        const captainIds = i.values;
        await i.update({
            content: "Captains picked successfully!",
            components: [],
        });

        const captains = captainIds.map(id => lobby.getPlayer(id));
        const teamAIds = [captains[0].id];
        const teamBIds = [captains[1].id];

        if (!lobby.updateTeams(teamAIds, teamBIds, true)) {
            await updateTeamsFailedReply(i);
            return;
        }
        await lobby.update();

        for (let j = 0; j < draftOrder.length; j++) {
            let currentCaptain: GuildMember, currentTeamIds: Snowflake[];
            if (j % 2 == 0) {
                currentCaptain = captains[0];
                currentTeamIds = teamAIds;
            } else {
                currentCaptain = captains[1];
                currentTeamIds = teamBIds;
            }

            const remainingPlayers = lobby.players.filter(
                player => !(teamAIds.includes(player.id) || teamBIds.includes(player.id))
            );
            const selector = getDraftSelector(lobby, currentCaptain, remainingPlayers, draftOrder[j]);
            const message = await i.channel.send({
                content: `Current picker: ${currentCaptain.displayName}`,
                components: [selector],
            });

            const draftCollector = message.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                filter: m => m.customId === getDraftSelectorId(lobby, currentCaptain),
            });
            lobby.addBalanceCollector(draftCollector);

            draftCollector.on("collect", async collected => {
                if (collected.user.id !== currentCaptain.id) {
                    await collected.reply({
                        content: "Only the current picker can use this.",
                        ephemeral: true,
                    });
                    return;
                }

                currentTeamIds.push(...collected.values);
                await collected.update({
                    content:
                        `${currentCaptain.displayName} selected:\n` +
                        collected.values.map(id => `- ${lobby.getPlayer(id).displayName}`).join("\n"),
                    components: [],
                });
                await collected.deleteReply();

                draftCollector.stop();
            });

            draftCollector.on("end", async collected => {
                const collectedFromCaptain = collected.filter(i => i.member.id === currentCaptain.id);
                if (!collectedFromCaptain) {
                    // If it didn't collect anything, then the collector ended because the players changed
                    await interaction.editReply({
                        content:
                            "Canceling since someone joined or left during balancing. You can run `/balance` to try again.",
                        components: [],
                    });

                    if (message.editable) {
                        await message.edit({
                            content: "Canceling since someone joined or left during balancing.",
                            components: [],
                        });
                    }
                    return;
                }
            });

            await message.awaitMessageComponent({
                filter: m =>
                    m.customId === getDraftSelectorId(lobby, currentCaptain) && m.member.id === currentCaptain.id,
            });

            if (!lobby.updateTeams(teamAIds, teamBIds, true)) {
                await updateTeamsFailedReply(i);
                return;
            }
            await lobby.update();
        }

        await interaction.editReply({
            content:
                "Teams are picked! Run `/start` to move everyone to their own channel. If you need to make changes to the teams, run `/balance` again.",
        });
    });
};
