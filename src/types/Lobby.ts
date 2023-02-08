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
} from "discord.js";

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
    public constructor() {
        this.captain = null;
        this.players = new Collection();
    }

    captain?: GuildMember;
    players: GuildMemberCollection;
}

export class Lobby {
    public state: LobbyState;
    public channelIds: Snowflake[];
    public readonly owner: GuildMember;
    public readonly guild: Guild;
    public readonly channel: GuildTextBasedChannel;
    public readonly players: GuildMemberCollection;
    public readonly teams: Collection<TeamLabel, Team>;

    // Main message representing the lobby status
    private _message: Message;

    // Channels created for the lobby
    private _category: CategoryChannel;
    private _channelA: VoiceChannel;
    private _channelB: VoiceChannel;

    public constructor(owner: GuildMember, guild: Guild, channel: GuildTextBasedChannel) {
        this.state = LobbyState.Waiting;
        this.channelIds = [];
        this.owner = owner;
        this.guild = guild;
        this.channel = channel;
        this.players = new Collection();
        this.teams = new Collection([
            [TeamLabel.NoTeam, new Team()],
            [TeamLabel.TeamA, new Team()],
            [TeamLabel.TeamB, new Team()],
        ]);
    }

    public async destroy() {
        if (this._message) await this._message.delete();
        if (this._channelB) await this._channelB.delete();
        if (this._channelA) await this._channelA.delete();
        if (this._category) await this._category.delete();
    }

    public async start() {
        const { teamA, teamB } = this.getTeams();

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
            await Promise.all(this._category.members.map(member => member.voice.setChannel(channel)));
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
        const { teamA, teamB } = this.getTeams();

        const embed = getLobbyStatus(this);
        const lobbyButtons = getLobbyButtons(this);
        if (this._message) {
            this._message.edit({
                embeds: [embed],
                components: [lobbyButtons],
            });
        } else {
            this._message = await this.channel.send({
                embeds: [embed],
                components: [lobbyButtons],
            });

            const collector = this._message.createMessageComponentCollector({
                filter: m => parseButtonId(m.customId).ownerId === this.owner.id,
            });

            const lobby = this;
            collector.on("collect", async i => {
                if (!i.isButton()) {
                    console.error("Button filter picked up a non-button interaction");
                    return;
                }

                const client: ValoQuestionMarkClient = i.client as ValoQuestionMarkClient;
                const { buttonType } = parseButtonId(i.customId);

                const handler = client.buttons.get(buttonType);
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

    public getTeams() {
        return {
            teamA: this.teams.get(TeamLabel.TeamA),
            teamB: this.teams.get(TeamLabel.TeamB),
            noTeam: this.teams.get(TeamLabel.NoTeam),
        };
    }

    public isFull(): boolean {
        return this.players.size === MAX_LOBBY_SIZE;
    }

    public hasPlayer(member: GuildMember): boolean {
        return this.players.has(member.id);
    }

    public addPlayer(member: GuildMember): void {
        if (this.players.has(member.id)) {
            console.warn(`${member.displayName} was added twice to the lobby`);
            return;
        }
        this.players.set(member.id, member);
        this.teams.get(TeamLabel.NoTeam).players.set(member.id, member);
        this.state = LobbyState.Waiting;
    }

    public removePlayer(member: GuildMember): void {
        if (this.players.has(member.id)) {
            this.players.delete(member.id);
            this.state = LobbyState.Waiting;
        } else {
            console.warn(`Attempted to remove ${member.displayName} who was not in the lobby`);
        }

        if (!this.teams.some(team => team.players.delete(member.id)))
            console.warn(`Team status of ${member.displayName} was inconsistent`);
    }

    public moveToTeam(member: GuildMember, teamLabel: TeamLabel): void {
        if (!this.players.has(member.id)) {
            console.warn(`Tried to move non-existent user ${member.displayName}`);
            return;
        }

        if (this.teams.get(teamLabel).players.size === MAX_TEAM_SIZE) {
            console.warn(`Tried to move user ${member.displayName} to a full team`);
            return;
        }

        this.teams.forEach(team => team.players.delete(member.id));
        this.teams.get(teamLabel).players.set(member.id, member);
    }

    public teamOf(player: GuildMember): TeamLabel | null {
        if (!this.players.has(player.id)) return null;
        for (const teamLabel in TeamLabel) {
            if (this.teams.get(TeamLabel[teamLabel] as TeamLabel).players.has(player.id)) {
                return teamLabel as TeamLabel;
            }
        }
    }

    public resetTeams(): void {
        this.players.forEach(member => this.teams.get(TeamLabel.NoTeam).players.set(member.id, member));
        this.teams.set(TeamLabel.TeamA, new Team());
        this.teams.set(TeamLabel.TeamB, new Team());
    }
}
