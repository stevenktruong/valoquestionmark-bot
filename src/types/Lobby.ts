import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Collection,
    EmbedBuilder,
    GuildTextBasedChannel,
    Message,
    User,
} from "discord.js";

import { PlayerManager } from "./PlayerManager";

export const MAX_LOBBY_SIZE = 10;
export const MAX_TEAM_SIZE = 5;

export enum LobbyState {
    Waiting = "Waiting", // Waiting for players to join
    Full = "Full", // Full lobby without teams made

    OwnerPicking = "OwnerPicking", // Lobby owner picks manually

    PickingCaptains = "PickingCaptains", // Pick team captains for draft
    Drafting = "Drafting", // Team captains pick

    Ready = "Ready", // After teams have been made
    Playing = "Playing", // Game has started
}

export class Lobby {
    public constructor(owner: User, channel: GuildTextBasedChannel) {
        this.state = LobbyState.Waiting;
        this.owner = owner;
        this.channel = channel;
        this.playerManager = new PlayerManager(new Collection());
    }

    public state: LobbyState;
    public owner: User;
    public channel: GuildTextBasedChannel;
    public playerManager: PlayerManager;

    private _message: Message;

    public async updateMessage() {
        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`${this.owner.username}'s Customs Lobby`)
            .setAuthor({
                name: `${this.owner.username}`,
                iconURL: this.owner.avatarURL(),
            })
            .setDescription("Click Join to join the lobby")
            .addFields(
                { name: "Inline field title", value: "Some value here", inline: true },
                { name: "Inline field title", value: "Some value here", inline: true },
                { name: "\u200B", value: "\u200B" },
                { name: "Players", value: "Some value here" }
            )
            .setTimestamp();

        const joinButtonId = `${this.owner.id}-join`;
        const joinButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId(joinButtonId).setLabel("Join lobby").setStyle(ButtonStyle.Primary)
        );

        console.log(this.owner.id);

        if (this._message) {
            this._message.edit({
                embeds: [embed],
                components: [joinButton],
            });
        } else {
            this._message = await this.channel.send({
                embeds: [embed],
                components: [joinButton],
            });
        }
    }
}
