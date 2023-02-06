import { Collection } from "discord.js";

import { Command } from "types/ValoQuestionMarkClient";

import balance from "./balance";
import create from "./create";
import _delete from "./delete";
import refresh from "./refresh";
import start from "./start";
import stop from "./stop";

const commands = new Collection<string, Command>();
commands.set("balance", balance);
commands.set("create", create);
commands.set("delete", _delete);
commands.set("refresh", refresh);
commands.set("start", start);
commands.set("stop", stop);

export default commands;
