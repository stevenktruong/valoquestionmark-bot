import {
    ChatInputCommandInteraction,
    Client,
    GatewayIntentBits,
    Snowflake,
    Collection,
    User,
    ButtonInteraction,
} from "discord.js";

import { ButtonType } from "buttons";

import { Lobby } from "./Lobby";

export class ValoQuestionMarkClient extends Client {
    public constructor(commands: Collection<string, Command>, buttonHandlers: Collection<ButtonType, ButtonHandler>) {
        super({ intents: [GatewayIntentBits.Guilds] });

        this.commands = commands;
        this.buttonHandlers = buttonHandlers;
        this.lobbies = new Collection();
    }

    public commands: Collection<string, Command>;
    public buttonHandlers: Collection<ButtonType, ButtonHandler>;
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

export type ButtonHandler = (i: ButtonInteraction) => unknown;
