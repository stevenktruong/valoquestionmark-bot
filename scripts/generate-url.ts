import { OAuth2Scopes, PermissionFlagsBits, PermissionsBitField } from "discord.js";

import dotenv from "dotenv";

dotenv.config();
const { CLIENT_ID } = process.env;

if (!CLIENT_ID) {
    console.error("Missing CLIENT_ID from .env file");
    process.exit(1);
}
const scopes = [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands];

const permissions = new PermissionsBitField([
    PermissionFlagsBits.ManageChannels,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.ManageMessages,
    PermissionFlagsBits.MoveMembers,
]);

const url = new URL("https://discord.com/api/oauth2/authorize");
url.searchParams.set("client_id", CLIENT_ID);
url.searchParams.set("permissions", permissions.bitfield.toString());
url.searchParams.set("scope", scopes.join(" "));

console.log(url.href);
