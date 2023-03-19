import { Snowflake } from "discord.js";

export enum Player {
    Andy = "andy",
    Brandon = "brandon",
    Bree = "bree",
    Brian = "brian",
    Cade = "cade",
    Darwin = "darwin",
    Josh = "josh",
    Lindsey = "lindsey",
    // Sequential = "sequential",
    Sophie = "sophie",
    Steve = "steve",
    Steven = "steven",
    Sun = "sun",
    Susi = "susi",
    Susu = "susu",
    Tang = "tang",
    Yang = "yang",
}

export const discordIdToPlayer: Record<Snowflake, Player> = {
    "122974482125160451": Player.Andy,
    "414558194103353347": Player.Brandon,
    "465012692243972096": Player.Bree,
    "716862437051072613": Player.Brian,
    "159010251604099072": Player.Cade,
    "227628131203284992": Player.Darwin,
    "136291638258434048": Player.Josh,
    "784653839453388821": Player.Lindsey,
    // "307995289766330378": Player.Sequential,
    "191092499056558080": Player.Sophie,
    "177821762933751808": Player.Steve,
    "120048657679646720": Player.Steven,
    "739347324639117393": Player.Sun,
    "748063317146206239": Player.Susi,
    "754184839862943904": Player.Susu,
    "90542664977485824": Player.Tang,
    "269983676559785986": Player.Yang,
};

export const playerToDiscordId: Record<Player, Snowflake> = {
    [Player.Andy]: "122974482125160451",
    [Player.Brandon]: "414558194103353347",
    [Player.Bree]: "465012692243972096",
    [Player.Brian]: "716862437051072613",
    [Player.Cade]: "159010251604099072",
    [Player.Darwin]: "227628131203284992",
    [Player.Josh]: "136291638258434048",
    [Player.Lindsey]: "784653839453388821",
    // [Player.Sequential]: "307995289766330378",
    [Player.Sophie]: "191092499056558080",
    [Player.Steve]: "177821762933751808",
    [Player.Steven]: "120048657679646720",
    [Player.Sun]: "739347324639117393",
    [Player.Susi]: "748063317146206239",
    [Player.Susu]: "754184839862943904",
    [Player.Tang]: "90542664977485824",
    [Player.Yang]: "269983676559785986",
};

export const getPlayerFromId = (id: Snowflake) => {
    if (id in discordIdToPlayer) return discordIdToPlayer[id];
    else return null;
};

export const getIdFromPlayer = (player: Player) => {
    if (player in playerToDiscordId) return playerToDiscordId[player];
    else return null;
};
