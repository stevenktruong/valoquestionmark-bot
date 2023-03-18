import { Collection } from "discord.js";

import { ButtonHandler } from "types/ValoQuestionMarkClient";

import { handleJoin } from "./join";
import { handleLeave } from "./leave";

export enum ButtonName {
    Join = "Join",
    Leave = "Leave",

    OwnerPicks = "OwnerPicks",
    Draft = "Draft",

    Start = "Start",
    ResetTeams = "ResetTeams",
    Finished = "Finished",
}

const buttons = new Collection<ButtonName, ButtonHandler>();
buttons.set(ButtonName.Join, handleJoin);
buttons.set(ButtonName.Leave, handleLeave);

export default buttons;
