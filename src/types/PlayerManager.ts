import { Collection, Snowflake, User } from "discord.js";

import { MAX_LOBBY_SIZE, MAX_TEAM_SIZE } from "./Lobby";

export enum TeamLabel {
    NoTeam = "NoTeam",
    TeamA = "TeamA",
    TeamB = "TeamB",
}

type UserCollection = Collection<Snowflake, User>;

export interface Team {
    captain?: User;
    players: UserCollection;
}

export class PlayerManager {
    public constructor(players: UserCollection) {
        this.players = players;
        this.teams = new Collection();
        this.teams.set(TeamLabel.NoTeam, new Collection());
        this.teams.set(TeamLabel.TeamA, new Collection());
        this.teams.set(TeamLabel.TeamB, new Collection());
    }

    public players: UserCollection;
    private teams: Collection<TeamLabel, UserCollection>;

    public isFull(): boolean {
        return this.players.size === MAX_LOBBY_SIZE;
    }

    public addPlayer(user: User): void {
        if (this.players.has(user.id)) {
            console.warn(`${user.username} was added twice to the lobby`);
            return;
        }
        this.players.set(user.id, user);
        this.teams[TeamLabel.NoTeam].set(user.id, user);
    }

    public removePlayer(user: User): void {
        if (this.players.has(user.id)) this.players.delete(user.id);
        else console.warn(`Attempted to remove ${user.username} who was not in the lobby`);

        if (!this.teams.every(team => team.delete(user.id)))
            console.warn(`Team status of ${user.username} was inconsistent`);
    }

    public moveToTeam(user: User, teamLabel: TeamLabel): void {
        if (!this.players.has(user.id)) {
            console.warn(`Tried to move non-existent user ${user.username}`);
            return;
        }

        if (this.teams.get(teamLabel).size === MAX_TEAM_SIZE) {
            console.warn(`Tried to move user ${user.username} to a full team`);
            return;
        }

        this.teams.forEach(team => team.delete(user.id));
        this.teams.get(teamLabel).set(user.id, user);
    }

    public teamOf(player: User): TeamLabel | null {
        if (!this.players.has(player.id)) return null;
        for (const teamLabel in TeamLabel) {
            this.teams.get(TeamLabel[teamLabel] as TeamLabel).has(player.id);
            return teamLabel as TeamLabel;
        }
    }

    public resetTeams(): void {
        this.players.forEach(user => this.teams.get(TeamLabel.NoTeam).set(user.id, user));
        this.teams.set(TeamLabel.TeamA, new Collection());
        this.teams.set(TeamLabel.TeamB, new Collection());
    }
}
