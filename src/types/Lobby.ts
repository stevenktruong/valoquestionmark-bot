import {
    Collection,
    GuildTextBasedChannel,
    Message,
    GuildMember,
    Guild,
    ChannelType,
    CategoryChannel,
    VoiceChannel,
    Snowflake,
    InteractionCollector,
} from "discord.js";

import { Logger } from "pino";

import { parseButtonId, getLobbyButtons } from "components/lobbyButtons";
import { getLobbyStatus } from "embeds/lobbyStatus";
import { ValoQuestionMarkClient } from "types/ValoQuestionMarkClient";

export const MAX_LOBBY_SIZE = 10;
export const MAX_TEAM_SIZE = 5;

export enum LobbyState {
    Waiting = "Waiting", // Before teams have been made
    Balanced = "Balanced", // After teams have been made

    OwnerPicking = "OwnerPicking", // Lobby owner picks manually

    PickingCaptains = "PickingCaptains", // Pick team captains for draft
    Drafting = "Drafting", // Team captains pick

    Playing = "Playing", // Game has started
}

export enum TeamLabel {
    NoTeam = "NoTeam",
    TeamA = "TeamA",
    TeamB = "TeamB",
}

type GuildMemberCollection = Collection<Snowflake, GuildMember>;

export class Team {
    public constructor(players: GuildMemberCollection = new Collection(), captain: GuildMember = null) {
        this.captain = captain;
        this.players = players;
    }

    captain?: GuildMember;
    players: GuildMemberCollection;
}

export class Lobby {
    public readonly owner: GuildMember;
    public readonly guild: Guild;
    public readonly channel: GuildTextBasedChannel;

    private _state: LobbyState;
    private _channelIds: Snowflake[];

    private _players: GuildMemberCollection;
    private _teamA: Team;
    private _teamB: Team;

    private _message: Message; // Main message representing the lobby status
    private _balanceCollectors: InteractionCollector<any>[]; // Collectors related to team balancing

    // Channels created for the lobby
    private _category: CategoryChannel;
    private _channelA: VoiceChannel;
    private _channelB: VoiceChannel;

    private _logger: Logger;

    public constructor(
        client: ValoQuestionMarkClient,
        owner: GuildMember,
        guild: Guild,
        channel: GuildTextBasedChannel
    ) {
        this.owner = owner;
        this.guild = guild;
        this.channel = channel;
        this._state = LobbyState.Waiting;
        this._channelIds = [];
        this._players = new Collection();
        this._teamA = new Team();
        this._teamB = new Team();
        this._balanceCollectors = [];
        this._logger = client.logger.child({
            guild: guild.name,
            owner: owner.displayName,
            channel: channel.name,
        });
    }

    public async destroy() {
        this._balanceCollectors.map(collector => collector.stop());
        if (this._message) await this._message.delete();
        if (this._channelB) await this._channelB.delete();
        if (this._channelA) await this._channelA.delete();
        if (this._category) await this._category.delete();
    }

    public async start() {
        const { teamA, teamB } = this.teams;

        this._category = await this.guild.channels.create({
            name: `${this.owner.displayName}'s Customs`,
            type: ChannelType.GuildCategory,
        });
        this._channelA = await this._category.children.create({ name: "attackers", type: ChannelType.GuildVoice });
        this._channelB = await this._category.children.create({ name: "defenders", type: ChannelType.GuildVoice });
        this._channelIds = [this._category.id, this._channelA.id, this._channelB.id];

        await Promise.all([
            ...teamA.players
                .filter(member => member.voice && member.voice.channel)
                .map(member => member.voice.setChannel(this._channelA)),
            ...teamB.players
                .filter(member => member.voice && member.voice.channel)
                .map(member => member.voice.setChannel(this._channelB)),
        ]);

        this._state = LobbyState.Playing;
    }

    public async stop(channel: VoiceChannel) {
        await Promise.all(
            this._category.members
                .filter(member => member.voice && member.voice.channel)
                .map(member => member.voice.setChannel(channel))
        );

        if (this._channelB) await this._channelB.delete();
        if (this._channelA) await this._channelA.delete();
        if (this._category) await this._category.delete();

        this._channelB = null;
        this._channelA = null;
        this._category = null;
        this._channelIds = [];
        this._state = LobbyState.Balanced;
    }

    public async update() {
        const embed = getLobbyStatus(this);
        const lobbyButtons = getLobbyButtons(this);
        if (this._message) {
            await this._message.edit({
                embeds: [embed],
                components: [lobbyButtons],
            });
        } else {
            this._message = await this.channel.send({
                embeds: [embed],
                components: [lobbyButtons],
            });

            // This should not be added to _balanceCollectors
            const collector = this._message.createMessageComponentCollector({
                filter: m => parseButtonId(m.customId).ownerId === this.owner.id,
            });

            const lobby = this;
            collector.on("collect", async i => {
                if (!i.isButton()) {
                    this._logger.warn(
                        {
                            interaction: {
                                customId: i.customId,
                                interactionId: i.id,
                                user: i.user.id,
                            },
                        },
                        "Non-button interaction had the custom id of a button."
                    );
                    return;
                }

                const client: ValoQuestionMarkClient = i.client as ValoQuestionMarkClient;
                const { buttonType } = parseButtonId(i.customId);

                const handler = client.buttons.get(buttonType);
                try {
                    handler(i);
                } catch (error) {
                    this._logger.error(error);
                    await i.reply({ content: "There was an error while handling this button!", ephemeral: true });
                }

                await lobby.update();
            });
        }
    }

    public get state(): LobbyState {
        return this._state;
    }

    public get channelIds(): Snowflake[] {
        return this._channelIds;
    }

    public get players(): GuildMember[] {
        return this._players.map(member => member);
    }

    public get teams() {
        // TODO: Make sure these are immutable
        return {
            teamA: this._teamA,
            teamB: this._teamB,
        };
    }

    public get size(): number {
        return this._players.size;
    }

    public addBalanceCollector(collector: InteractionCollector<any>) {
        this._balanceCollectors.push(collector);
    }

    public resetBalancing() {
        this._balanceCollectors.map(collector => collector.stop());
        this._balanceCollectors = [];
        this._state = LobbyState.Waiting;
    }

    public isFull(): boolean {
        return this._players.size === MAX_LOBBY_SIZE;
    }

    public getPlayer(id: Snowflake): GuildMember | null {
        if (this._players.has(id)) return this._players.get(id);
        else return null;
    }

    public hasPlayer(member: GuildMember): boolean {
        return this._players.has(member.id);
    }

    public addPlayer(member: GuildMember): void {
        if (this._players.has(member.id)) {
            this._logger.warn(
                {
                    member: {
                        name: member.displayName,
                        id: member.id,
                    },
                },
                "Attempted to add a duplicate member."
            );
            return;
        }
        this.resetBalancing();
        this._players.set(member.id, member);
        this._state = LobbyState.Waiting;
    }

    public removePlayer(member: GuildMember): void {
        if (this._players.has(member.id)) {
            this.resetBalancing();
            this._players.delete(member.id);
            this._state = LobbyState.Waiting;
        } else {
            this._logger.warn(
                {
                    member: {
                        name: member.displayName,
                        id: member.id,
                    },
                },
                "Attempted to remove a non-existent player."
            );
        }
    }

    public makeTeams(teamAIds: Snowflake[], teamBIds: Snowflake[]): boolean {
        let validTeams = true;
        const invalidIds = [];
        [teamAIds, teamBIds].forEach(playerIds =>
            playerIds.forEach(id => {
                if (!this._players.has(id)) {
                    invalidIds.push(id);
                    validTeams = false;
                }
            })
        );
        if (!validTeams) {
            this._logger.warn(
                {
                    teams: {
                        teamAIds,
                        teamBIds,
                    },
                    invalidIds,
                },
                "Tried to make teams with some player ids not in the lobby."
            );
            return false;
        }

        const teamA = new Team(new Collection(teamAIds.map(id => [id, this._players.get(id)])));
        const teamB = new Team(new Collection(teamBIds.map(id => [id, this._players.get(id)])));

        this._teamA = teamA;
        this._teamB = teamB;
        this._state = LobbyState.Balanced;

        return true;
    }

    public swapTeams() {
        const temp = this._teamA;
        this._teamA = this._teamB;
        this._teamB = temp;
    }

    public teamOf(player: GuildMember): TeamLabel | null {
        if (!this._players.has(player.id)) return null;
        if (this._teamA.players.has(player.id)) return TeamLabel.TeamA;
        if (this._teamB.players.has(player.id)) return TeamLabel.TeamB;
        return TeamLabel.NoTeam;
    }

    public resetTeams(): void {
        this._teamA = new Team();
        this._teamB = new Team();
    }
}
