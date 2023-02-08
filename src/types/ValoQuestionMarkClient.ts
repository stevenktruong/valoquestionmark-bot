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

import { BalanceStrategy } from "balance";
import { ButtonType } from "buttons";

import { Lobby } from "./Lobby";

export class ValoQuestionMarkClient extends Client {
    public commands: Collection<string, Command>;
    public buttons: Collection<ButtonType, ButtonHandler>;
    public balanceStrategies: Collection<BalanceStrategy, BalanceStrategyHandler>;
    public lobbies: Collection<Snowflake, Lobby>;

    public constructor(
        commands: Collection<string, Command>,
        buttons: Collection<ButtonType, ButtonHandler>,
        balanceStrategies: Collection<BalanceStrategy, BalanceStrategyHandler>
    ) {
        super({ intents: [GatewayIntentBits.Guilds] });

        this.commands = commands;
        this.buttons = buttons;
        this.balanceStrategies = balanceStrategies;
        this.lobbies = new Collection();
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
