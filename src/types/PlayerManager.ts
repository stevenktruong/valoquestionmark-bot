import { Collection, Snowflake, GuildMember } from "discord.js";

import { MAX_LOBBY_SIZE, MAX_TEAM_SIZE } from "./Lobby";

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

export class PlayerManager {
    public constructor(players: GuildMemberCollection) {
        this.players = players;
        this.teams = new Collection();
        this.teams.set(TeamLabel.NoTeam, new Team());
        this.teams.set(TeamLabel.TeamA, new Team());
        this.teams.set(TeamLabel.TeamB, new Team());
    }

    public readonly players: GuildMemberCollection;
    public readonly teams: Collection<TeamLabel, Team>;

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
    }

    public removePlayer(member: GuildMember): void {
        if (this.players.has(member.id)) this.players.delete(member.id);
        else console.warn(`Attempted to remove ${member.displayName} who was not in the lobby`);

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
