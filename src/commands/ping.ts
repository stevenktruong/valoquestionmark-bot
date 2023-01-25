import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder().setName("ping").setDescription("Bruh"),
    execute: async (interaction: ChatInputCommandInteraction) => await interaction.reply("Pong"),
};
