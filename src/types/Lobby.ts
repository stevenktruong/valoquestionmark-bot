import {
    Collection,
    EmbedBuilder,
    GuildTextBasedChannel,
    Message,
    GuildMember,
    Guild,
    ChannelType,
    CategoryChannel,
    VoiceChannel,
    Snowflake,
} from "discord.js";

import { parseButtonId, getLobbyButtons } from "components/lobbyButtons";
import { PlayerManager } from "types/PlayerManager";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

export const MAX_LOBBY_SIZE = 10;
export const MAX_TEAM_SIZE = 5;

export enum LobbyState {
    Waiting = "Waiting", // After teams have been made

    OwnerPicking = "OwnerPicking", // Lobby owner picks manually

    PickingCaptains = "PickingCaptains", // Pick team captains for draft
    Drafting = "Drafting", // Team captains pick

    Playing = "Playing", // Game has started
}

export class Lobby {
    public constructor(owner: GuildMember, guild: Guild, channel: GuildTextBasedChannel) {
        this.state = LobbyState.Waiting;
        this.channelIds = [];
        this.owner = owner;
        this.guild = guild;
        this.channel = channel;
        this.playerManager = new PlayerManager(new Collection());
    }

    public state: LobbyState;
    public channelIds: Snowflake[];
    public readonly owner: GuildMember;
    public readonly guild: Guild;
    public readonly channel: GuildTextBasedChannel;
    public readonly playerManager: PlayerManager;

    // Main message representing the lobby status
    private _message: Message;

    // Channels created for the lobby
    private _category: CategoryChannel;
    private _channelA: VoiceChannel;
    private _channelB: VoiceChannel;

    public async destroy() {
        if (this._channelB) await this._channelB.delete();
        if (this._channelA) await this._channelA.delete();
        if (this._category) await this._category.delete();
    }

    public async start() {
        const { teamA, teamB } = this.playerManager.getTeams();

        this._category = await this.guild.channels.create({
            name: `${this.owner.displayName}'s Customs`,
            type: ChannelType.GuildCategory,
        });
        this._channelA = await this._category.children.create({ name: "attackers", type: ChannelType.GuildVoice });
        this._channelB = await this._category.children.create({ name: "defenders", type: ChannelType.GuildVoice });

        this.channelIds = [this._category.id, this._channelA.id, this._channelB.id];

        try {
            await Promise.all([
                ...teamA.players.filter(member => member.voice).map(member => member.voice.setChannel(this._channelA)),
                ...teamB.players.filter(member => member.voice).map(member => member.voice.setChannel(this._channelB)),
            ]);
        } catch (error) {
            // Ignore errors when moving players since we don't care if it succeeds or not
        }

        this.state = LobbyState.Playing;
    }

    public async stop(channel: VoiceChannel) {
        try {
            await Promise.all(
                this.playerManager.players
                    .filter(member => member.voice)
                    .map(member => member.voice.setChannel(channel))
            );
        } catch (error) {
            // Ignore errors when moving players since we don't care if it succeeds or not
        }

        if (this._channelB) await this._channelB.delete();
        if (this._channelA) await this._channelA.delete();
        if (this._category) await this._category.delete();

        this._channelB = null;
        this._channelA = null;
        this._category = null;

        this.channelIds = [];

        this.state = LobbyState.Waiting;
    }

    public async update() {
        const { teamA, teamB } = this.playerManager.getTeams();

        const embed = new EmbedBuilder()
            .setColor(this.state !== LobbyState.Playing ? "Blue" : "Green")
            .setThumbnail(
                "https://raw.githubusercontent.com/candysan7/valorant-customs-stats/main/home-page/logo-v3.png"
            )
            .setTitle(`${this.owner.displayName}'s Customs Lobby`)
            .setAuthor({
                name: `${this.owner.displayName}`,
                iconURL: this.owner.displayAvatarURL(),
            })
            .setDescription(this.state !== LobbyState.Playing ? "Click Join to join the lobby" : "Lobby is in progress")
            .addFields(
                {
                    name: "Attackers",
                    value:
                        teamA.players.size > 0 ? teamA.players.map(member => member.displayName).join("\n") : "\u200b",
                    inline: true,
                },
                {
                    name: "Defenders",
                    value:
                        teamB.players.size > 0 ? teamB.players.map(member => member.displayName).join("\n") : "\u200b",
                    inline: true,
                },
                {
                    name: "Players",
                    value:
                        this.playerManager.players.size > 0
                            ? this.playerManager.players.map(member => member.displayName).join("\n")
                            : "\u200b",
                }
            )
            .setTimestamp();

        if (this._message) {
            this._message.edit({ embeds: [embed] });
        } else {
            const lobbyButtons = getLobbyButtons(this);

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

                await lobby.update();
            });
        }
    }
}
