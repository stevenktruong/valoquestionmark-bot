import { Collection } from "discord.js";

import { Command } from "types/ValoQuestionMarkClient";

import create from "./create";
import refresh from "./refresh";

const commands = new Collection<string, Command>();
commands.set("create", create);
commands.set("refresh", refresh);

export default commands;
