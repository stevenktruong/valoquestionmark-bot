import { Collection } from "discord.js";

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

const buttons = new Collection<ButtonType, ButtonHandler>();
buttons.set(ButtonType.Join, handleJoin);
buttons.set(ButtonType.Leave, handleLeave);

export default buttons;
