import { Snowflake } from "discord.js";

export enum Player {
    Andy = "andy",
    Brandon = "brandon",
    Brian = "brian",
    Cade = "cade",
    Darwin = "darwin",
    Josh = "josh",
    Lindsey = "lindsey",
    Sequential = "sequential",
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
    "716862437051072613": Player.Brian,
    "159010251604099072": Player.Cade,
    "227628131203284992": Player.Darwin,
    "136291638258434048": Player.Josh,
    "784653839453388821": Player.Lindsey,
    "307995289766330378": Player.Sequential,
    "191092499056558080": Player.Sophie,
    "177821762933751808": Player.Steve,
    "120048657679646720": Player.Steven,
    "739347324639117393": Player.Sun,
    "748063317146206239": Player.Susi,
    "754184839862943904": Player.Susu,
    "90542664977485824": Player.Tang,
    "269983676559785986": Player.Yang,
};
