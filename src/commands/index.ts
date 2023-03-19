import { Collection } from "discord.js";

import { CommandHandler } from "types/ValoQuestionMarkClient";

import add from "./add";
import archive from "./archive";
import balance from "./balance";
import create from "./create";
import dashboard from "./dashboard";
import _delete from "./delete";
import refresh from "./refresh";
import remove from "./remove";
import start from "./start";
import stop from "./stop";
import swap from "./swap";

export enum CommandName {
    Add = "add",
    Archive = "archive",
    Balance = "balance",
    Create = "create",
    Dashboard = "dashboard",
    Delete = "delete",
    Refresh = "refresh",
    Remove = "remove",
    Start = "start",
    Stop = "stop",
    Swap = "swap",
}

const commands = new Collection<CommandName, CommandHandler>();
commands.set(CommandName.Add, add);
commands.set(CommandName.Balance, balance);
commands.set(CommandName.Archive, archive);
commands.set(CommandName.Create, create);
commands.set(CommandName.Delete, _delete);
commands.set(CommandName.Remove, remove);
commands.set(CommandName.Refresh, refresh);
commands.set(CommandName.Start, start);
commands.set(CommandName.Stop, stop);
commands.set(CommandName.Swap, swap);
commands.set(CommandName.Dashboard, dashboard);

export default commands;
