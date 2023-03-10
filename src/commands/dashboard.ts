import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import axios from "axios";

// import logger from "logger";

// Prevent axios from raising an error for 4XX HTTP response codes
axios.defaults.validateStatus = () => true;

const BACKEND_MATCH_ENDPOINT = "https://api.valoquestionmark.com/match";
const URL = "url";

export default {
    data: new SlashCommandBuilder()
        .setName("dashboard")
        .setDescription("Add a tracker.gg URL to the dashboard")
        .addStringOption(option => option.setName(URL).setDescription("URL to send").setRequired(true)),
    execute: async (interaction: ChatInputCommandInteraction) => {
        await interaction.deferReply({ ephemeral: true });

        const response = await axios.postForm(
            BACKEND_MATCH_ENDPOINT,
            axios.toFormData({ url: interaction.options.get(URL, true).value })
        );

        let content;
        switch (response.status) {
            case axios.HttpStatusCode.BadRequest:
                content = "The URL you sent was invalid!";
                break;
            case axios.HttpStatusCode.Locked:
                content = "The server is busy right now. Try again in a few minutes.";
                break;
            case axios.HttpStatusCode.Ok:
                content = "The match you sent is already included!";
                break;
            case axios.HttpStatusCode.Accepted:
                content =
                    "The match was successfully sent! If the URL was valid, the dashboard should be updated in a few minutes.";
                break;
            default:
                content = "The request failed for some unknown reason.";
                break;
        }

        await interaction.editReply({ content });
    },
};
