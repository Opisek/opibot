import { EmbedBuilder } from "discord.js";

function packageEmbed(embed: EmbedBuilder) {
    return {
        embed: embed,
        messageBody: { embeds: [ embed ]}
    };
}

export const simpleEmbed = (title: string, description: string) => packageEmbed(
    new EmbedBuilder().setTitle(title).setDescription(description)
);