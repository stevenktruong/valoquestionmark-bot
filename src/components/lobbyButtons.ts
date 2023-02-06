import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

import { ButtonType } from "buttons";
import { Lobby } from "types/Lobby";

export const getButtonId = (lobby: Lobby, buttonType: ButtonType) => `${lobby.owner.id}-${buttonType}`;
export const parseButtonId = (customId: string) => ({
    ownerId: customId.split("-")[0],
    buttonType: customId.split("-")[1] as ButtonType,
});

export const getLobbyButtons = (lobby: Lobby) =>
    new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId(getButtonId(lobby, ButtonType.Join))
            .setLabel("Join")
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(getButtonId(lobby, ButtonType.Leave))
            .setLabel("Leave")
            .setStyle(ButtonStyle.Danger)
    );