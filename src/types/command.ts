import { Message } from "discord.js";

export class Command {
    name: string;
    category: Category;
    run: (message: Message<boolean>) => void;

    constructor(name: string, category: Category, callback: (message: Message<boolean>) => void) {
        this.name = name;
        this.category = category;
        this.run = callback;
    }
}

export enum Category {
    generic,
    moderation
}