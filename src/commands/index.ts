import { Collection } from "discord.js";

import { Command } from "types/ValoQuestionMarkClient";

import create from "./create";

const commands = new Collection<string, Command>();
commands.set("create", create);

export default commands;
