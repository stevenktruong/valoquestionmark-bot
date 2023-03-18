import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

import { ButtonName } from "buttons";
import { Lobby, LobbyState } from "types/Lobby";

export const getButtonId = (lobby: Lobby, ButtonName: ButtonName) => `${lobby.owner.id}-${ButtonName}`;
export const parseButtonId = (customId: string) => ({
    ownerId: customId.split("-")[0],
    ButtonName: customId.split("-")[1] as ButtonName,
});

export const getLobbyButtons = (lobby: Lobby) =>
    new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId(getButtonId(lobby, ButtonName.Join))
            .setLabel("Join")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(lobby.state === LobbyState.Playing || lobby.isFull()),
        new ButtonBuilder()
            .setCustomId(getButtonId(lobby, ButtonName.Leave))
            .setLabel("Leave")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(lobby.state === LobbyState.Playing)
    );
