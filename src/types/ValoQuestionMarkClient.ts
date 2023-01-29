import { ChatInputCommandInteraction, Client, GatewayIntentBits, Snowflake, Collection, User } from "discord.js";

import { Lobby } from "./Lobby";

export class ValoQuestionMarkClient extends Client {
    public constructor(commands: Collection<string, Command>) {
        super({ intents: [GatewayIntentBits.Guilds] });

        this.commands = commands;
        this.lobbies = new Collection();
    }

    public commands: Collection<string, Command>;
    public lobbies: Collection<Snowflake, Lobby>;

    public newLobby(user: User, lobby: Lobby): boolean {
        if (this.lobbies.has(user.id)) return false;
        this.lobbies.set(user.id, lobby);
        return true;
    }
}

export interface Command {
    data: any;
    execute: (interaction: ChatInputCommandInteraction) => unknown;
}
