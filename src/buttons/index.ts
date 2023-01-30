import { Collection, User } from "discord.js";

import { ButtonHandler } from "types/ValoQuestionMarkClient";

import { handleJoin } from "./join";
import { handleLeave } from "./leave";

export enum ButtonType {
    Join = "Join",
    Leave = "Leave",

    OwnerPicks = "OwnerPicks",
    Draft = "Draft",

    Start = "Start",
    ResetTeams = "ResetTeams",
    Finished = "Finished",
}

export const getButtonId = (user: User, buttonType: ButtonType) => `${user.id}-${buttonType}`;
export const parseButtonId = (customId: string) => ({
    ownerId: customId.split("-")[0],
    buttonType: customId.split("-")[1] as ButtonType,
});

const buttons = new Collection<ButtonType, ButtonHandler>();
buttons.set(ButtonType.Join, handleJoin);
buttons.set(ButtonType.Leave, handleLeave);

export default buttons;
