import { ChatInputCommandInteraction, Collection, InteractionResponse, SlashCommandBuilder } from "discord.js";

import ping from "./ping";

interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<InteractionResponse<boolean>>;
}

const commands = new Collection<string, Command>();
commands.set("ping", ping);

export default commands;
