import { CacheType, ChatInputCommandInteraction } from "discord.js";

export class Command {
    name: string;
    description: string;
    category: Category;
    run: (message: ChatInputCommandInteraction<CacheType>) => void;

    constructor(name: string, description: string, category: Category, callback: (interaction: ChatInputCommandInteraction<CacheType>) => void) {
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