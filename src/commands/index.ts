import { Collection } from "discord.js";

import { Command } from "types/ValoQuestionMarkClient";

import add from "./add";
import balance from "./balance";
import create from "./create";
import _delete from "./delete";
import refresh from "./refresh";
import remove from "./remove";
import start from "./start";
import stop from "./stop";
import swap from "./swap";

const commands = new Collection<string, Command>();
commands.set("add", add);
commands.set("balance", balance);
commands.set("create", create);
commands.set("delete", _delete);
commands.set("remove", remove);
commands.set("refresh", refresh);
commands.set("start", start);
commands.set("stop", stop);
commands.set("swap", swap);

export default commands;
