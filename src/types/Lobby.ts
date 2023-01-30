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

import { ButtonType, getButtonId, parseButtonId } from "buttons";
import { PlayerManager } from "types/PlayerManager";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

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

    public async update() {
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
                {
                    name: "Players",
                    value:
                        this.playerManager.players.size > 0
                            ? this.playerManager.players.map(user => user.username).join("\n")
                            : "\u200b",
                }
            )
            .setTimestamp();

        if (this._message) {
            this._message.edit({ embeds: [embed] });
        } else {
            const lobbyButtons = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(getButtonId(this.owner, ButtonType.Join))
                        .setLabel("Join lobby")
                        .setStyle(ButtonStyle.Primary)
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(getButtonId(this.owner, ButtonType.Leave))
                        .setLabel("Leave lobby")
                        .setStyle(ButtonStyle.Danger)
                );

            this._message = await this.channel.send({
                embeds: [embed],
                components: [lobbyButtons],
            });

            const collector = this._message.createMessageComponentCollector({
                filter: m => m.customId.split("-")[0] === this.owner.id,
            });

            const lobby = this;
            collector.on("collect", async i => {
                if (!i.isButton()) {
                    console.error("Button filter picked up a non-button interaction");
                    return;
                }

                const client: ValoQuestionMarkClient = i.client as ValoQuestionMarkClient;
                const { buttonType } = parseButtonId(i.customId);

                const handler = client.buttonHandlers.get(buttonType);
                try {
                    handler(i);
                } catch (error) {
                    console.error(error);
                    await i.reply({ content: "There was an error while handling this button!", ephemeral: true });
                }

                lobby.update();
            });
        }
    }
}
