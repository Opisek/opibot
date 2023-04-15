import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { GuildSettings } from "../modules/database/models/guildSettings";

export class Command {
    name: string;
    description: string;
    category: Category;
    run: (message: ChatInputCommandInteraction<CacheType>, guildSettings: GuildSettings) => void;

    constructor(
        name: string,
        description: string,
        category: Category,
        callback: (
            interaction: ChatInputCommandInteraction<CacheType>,
            guildSettings: GuildSettings
        ) => void
    ) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.run = callback;
    }
}

export enum Category {
    generic,
    moderation
}