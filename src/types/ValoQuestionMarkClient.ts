import {
    ChatInputCommandInteraction,
    Client,
    GatewayIntentBits,
    Snowflake,
    Collection,
    ButtonInteraction,
    GuildMember,
    AutocompleteInteraction,
} from "discord.js";

import { Logger } from "pino";

import { BalanceStrategy } from "balance";
import { ButtonType } from "buttons";
import logger from "logger";

import { Lobby } from "./Lobby";

export class ValoQuestionMarkClient extends Client {
    private _commands: Collection<string, Command>;
    private _buttons: Collection<ButtonType, ButtonHandler>;
    private _balanceStrategies: Collection<BalanceStrategy, BalanceStrategyHandler>;
    private _lobbies: Collection<Snowflake, Lobby>;

    private _logger: Logger;

    public constructor(
        commands: Collection<string, Command>,
        buttons: Collection<ButtonType, ButtonHandler>,
        balanceStrategies: Collection<BalanceStrategy, BalanceStrategyHandler>
    ) {
        super({ intents: [GatewayIntentBits.Guilds] });

        this._commands = commands;
        this._buttons = buttons;
        this._balanceStrategies = balanceStrategies;
        this._lobbies = new Collection();

        this._logger = logger;
    }

    get commands() {
        return this._commands;
    }

    get buttons() {
        return this._buttons;
    }

    get balanceStrategies() {
        return this._balanceStrategies;
    }

    get lobbies() {
        return this._lobbies;
    }

    get logger() {
        return this._logger;
    }

    public newLobby(member: GuildMember, lobby: Lobby): boolean {
        if (this.lobbies.has(member.id)) return false;
        this.lobbies.set(member.id, lobby);
        return true;
    }

    public async cleanup() {
        await Promise.all(this.lobbies.map(lobby => lobby.destroy()));
    }
}

export interface Command {
    data: any;
    execute: (interaction: ChatInputCommandInteraction) => unknown;
    autocomplete?: (interaction: AutocompleteInteraction) => unknown;
}

export type ButtonHandler = (interaction: ButtonInteraction) => unknown;

export type BalanceStrategyHandler = (interaction: ChatInputCommandInteraction) => unknown;
