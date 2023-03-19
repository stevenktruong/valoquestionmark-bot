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

import { BalanceStrategyName } from "balance";
import { ButtonName } from "buttons";
import { CommandName } from "commands";
import logger from "logger";

import { Lobby, LobbyState } from "./Lobby";

export class ValoQuestionMarkClient extends Client {
    private _commands: Collection<CommandName, CommandHandler>;
    private _buttons: Collection<ButtonName, ButtonHandler>;
    private _balanceStrategies: Collection<BalanceStrategyName, BalanceStrategyHandler>;
    private _lobbies: Collection<Snowflake, Lobby>;

    private _logger: Logger;

    public constructor(
        commands: Collection<CommandName, CommandHandler>,
        buttons: Collection<ButtonName, ButtonHandler>,
        balanceStrategies: Collection<BalanceStrategyName, BalanceStrategyHandler>
    ) {
        super({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

        this._commands = commands;
        this._buttons = buttons;
        this._balanceStrategies = balanceStrategies;
        this._lobbies = new Collection();

        this._logger = logger;

        // Every minute, delete lobbies that haven't been touched in over 2 hours
        setInterval(() => {
            const now = new Date();
            const expiredLobbies = this._lobbies
                // .filter(lobby => lobby.state == LobbyState.Waiting || lobby.state == LobbyState.Balanced)
                .filter(lobby => !lobby.hasPlayed)
                .filter(lobby => new Date(lobby.lastUpdated.getTime() + 2 * 60 * 60 * 1000) < now);

            expiredLobbies.forEach(async lobby => {
                this._lobbies.delete(lobby.owner.id);
                await lobby.destroy();
            });
        }, 60 * 1000);
    }

    public get commands() {
        return this._commands;
    }

    public get buttons() {
        return this._buttons;
    }

    public get balanceStrategies() {
        return this._balanceStrategies;
    }

    public get lobbies() {
        return this._lobbies;
    }

    public get logger() {
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

export interface CommandHandler {
    data: any;
    execute: (interaction: ChatInputCommandInteraction) => unknown;
    autocomplete?: (interaction: AutocompleteInteraction) => unknown;
}

export type ButtonHandler = (interaction: ButtonInteraction) => unknown;

export type BalanceStrategyHandler = (interaction: ChatInputCommandInteraction) => unknown;
