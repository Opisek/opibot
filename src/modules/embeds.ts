import { EmbedBuilder } from "discord.js";
import { Color } from "../types/embeds";
import { GuildSettings } from "./database/models/guildSettings";

function packageEmbed(embed: EmbedBuilder) {
    return {
        embed: embed,
        messageBody: { embeds: [ embed ] }
    };
}

export const simpleEmbed = (guildSettings: GuildSettings, title: string, description: string, color?: Color) => packageEmbed(
    new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(guildSettings.getColor(color || Color.primary))
);