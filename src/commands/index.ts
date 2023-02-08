import { Collection } from "discord.js";

import { Command } from "types/ValoQuestionMarkClient";

import add from "./add";
import balance from "./balance";
import create from "./create";
import _delete from "./delete";
import kick from "./kick";
import refresh from "./refresh";
import start from "./start";
import stop from "./stop";

const commands = new Collection<string, Command>();
commands.set("add", add);
commands.set("balance", balance);
commands.set("create", create);
commands.set("delete", _delete);
commands.set("kick", kick);
commands.set("refresh", refresh);
commands.set("start", start);
commands.set("stop", stop);

export default commands;
